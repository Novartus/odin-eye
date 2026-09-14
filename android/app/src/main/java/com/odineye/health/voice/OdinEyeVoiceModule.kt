package com.odineye.health.voice

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.Locale

/**
 * OdinEyeVoiceModule
 * Native on-device speech recognition (SpeechRecognizer) and on-device text-to-speech (TTS)
 * for OdinEye AI Health Coach. 100% offline, zero cloud transmission.
 */
class OdinEyeVoiceModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), TextToSpeech.OnInitListener {

    companion object {
        const val NAME = "OdinEyeVoiceModule"
    }

    private var speechRecognizer: SpeechRecognizer? = null
    private var textToSpeech: TextToSpeech? = null
    private var isTtsInitialized = false
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun getName(): String = NAME

    init {
        mainHandler.post {
            textToSpeech = TextToSpeech(reactContext, this)
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = textToSpeech?.setLanguage(Locale.US)
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                textToSpeech?.setLanguage(Locale.getDefault())
            }
            textToSpeech?.setSpeechRate(1.0f)
            textToSpeech?.setPitch(1.0f)

            textToSpeech?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {
                    sendEvent("onTtsStart", Arguments.createMap().apply {
                        putString("utteranceId", utteranceId)
                    })
                }

                override fun onDone(utteranceId: String?) {
                    sendEvent("onTtsDone", Arguments.createMap().apply {
                        putString("utteranceId", utteranceId)
                    })
                }

                @Deprecated("Deprecated in Java")
                override fun onError(utteranceId: String?) {
                    sendEvent("onTtsError", Arguments.createMap().apply {
                        putString("utteranceId", utteranceId)
                    })
                }
            })
            isTtsInitialized = true
        }
    }

    private fun sendEvent(eventName: String, params: Any?) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    @ReactMethod
    fun hasPermission(promise: Promise) {
        val granted = ContextCompat.checkSelfPermission(
            reactContext,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
        promise.resolve(granted)
    }

    @ReactMethod
    fun isRecognitionAvailable(promise: Promise) {
        try {
            val available = SpeechRecognizer.isRecognitionAvailable(reactContext)
            promise.resolve(available)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    private fun cleanupSpeechRecognizer() {
        try {
            speechRecognizer?.cancel()
            speechRecognizer?.destroy()
        } catch (e: Exception) {
            // ignore
        } finally {
            speechRecognizer = null
        }
    }

    @ReactMethod
    fun startListening(promise: Promise) {
        mainHandler.post {
            try {
                val hasAudioPerm = ContextCompat.checkSelfPermission(
                    reactContext,
                    Manifest.permission.RECORD_AUDIO
                ) == PackageManager.PERMISSION_GRANTED

                if (!hasAudioPerm) {
                    val errorMap = Arguments.createMap().apply {
                        putInt("code", SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS)
                        putString("message", "Microphone permission not granted. Please allow microphone access.")
                    }
                    sendEvent("onSpeechError", errorMap)
                    promise.reject("PERMISSION_DENIED", "Microphone permission not granted")
                    return@post
                }

                // Check system speech recognition availability
                if (!SpeechRecognizer.isRecognitionAvailable(reactContext)) {
                    val errorMap = Arguments.createMap().apply {
                        putInt("code", -1)
                        putString("message", "Speech recognition service is not available on this device. You can type your question directly.")
                    }
                    sendEvent("onSpeechError", errorMap)
                    promise.reject("UNAVAILABLE", "Speech recognition not available")
                    return@post
                }

                // Clean up any existing instance to prevent ERROR_RECOGNIZER_BUSY
                cleanupSpeechRecognizer()

                val context = reactContext.currentActivity ?: reactContext
                speechRecognizer = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S &&
                    SpeechRecognizer.isOnDeviceRecognitionAvailable(context)) {
                    try {
                        SpeechRecognizer.createOnDeviceSpeechRecognizer(context)
                    } catch (e: Exception) {
                        SpeechRecognizer.createSpeechRecognizer(context)
                    }
                } else {
                    SpeechRecognizer.createSpeechRecognizer(context)
                }

                speechRecognizer?.setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(params: Bundle?) {
                        sendEvent("onSpeechReady", Arguments.createMap())
                    }

                    override fun onBeginningOfSpeech() {
                        sendEvent("onSpeechStart", Arguments.createMap())
                    }

                    override fun onRmsChanged(rmsdB: Float) {
                        sendEvent("onSpeechRms", Arguments.createMap().apply {
                            putDouble("rms", rmsdB.toDouble())
                        })
                    }

                    override fun onBufferReceived(buffer: ByteArray?) {}

                    override fun onEndOfSpeech() {
                        sendEvent("onSpeechEnd", Arguments.createMap())
                    }

                    override fun onError(error: Int) {
                        val message = when (error) {
                            SpeechRecognizer.ERROR_AUDIO -> "Audio recording error. Please check your microphone."
                            SpeechRecognizer.ERROR_CLIENT -> "Client speech recognition error"
                            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Microphone permission denied"
                            SpeechRecognizer.ERROR_NETWORK -> "Network required for speech service or download offline language pack"
                            SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Speech recognition network timeout"
                            SpeechRecognizer.ERROR_NO_MATCH -> "No speech detected. Please speak clearly or choose a prompt below."
                            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Speech recognizer busy. Retrying..."
                            SpeechRecognizer.ERROR_SERVER -> "Speech server error"
                            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "Speech timed out. Tap microphone to speak again."
                            else -> "Speech recognition issue ($error)"
                        }
                        sendEvent("onSpeechError", Arguments.createMap().apply {
                            putInt("code", error)
                            putString("message", message)
                        })
                    }

                    override fun onResults(results: Bundle?) {
                        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        val text = if (!matches.isNullOrEmpty()) matches[0] else ""
                        if (text.isNotBlank()) {
                            sendEvent("onSpeechResult", Arguments.createMap().apply {
                                putString("text", text)
                            })
                        } else {
                            sendEvent("onSpeechError", Arguments.createMap().apply {
                                putInt("code", SpeechRecognizer.ERROR_NO_MATCH)
                                putString("message", "No words captured. Try speaking closer to the microphone.")
                            })
                        }
                    }

                    override fun onPartialResults(partialResults: Bundle?) {
                        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        val text = if (!matches.isNullOrEmpty()) matches[0] else ""
                        if (text.isNotBlank()) {
                            sendEvent("onSpeechPartial", Arguments.createMap().apply {
                                putString("text", text)
                            })
                        }
                    }

                    override fun onEvent(eventType: Int, params: Bundle?) {}
                })

                val localeTag = Locale.getDefault().toLanguageTag()
                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                    putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5)
                    putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, reactContext.packageName)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, localeTag)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, localeTag)
                    putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, localeTag)
                    putExtra("android.speech.extra.PREFER_OFFLINE", true)
                    putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 3000L)
                    putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 1500L)
                    putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 1500L)
                }

                speechRecognizer?.startListening(intent)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SPEECH_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun stopListening(promise: Promise) {
        mainHandler.post {
            try {
                speechRecognizer?.stopListening()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SPEECH_ERROR", e.message, e)
            }
        }
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        mainHandler.post {
            cleanupSpeechRecognizer()
            try {
                textToSpeech?.stop()
                textToSpeech?.shutdown()
            } catch (e: Exception) {}
        }
    }

    @ReactMethod
    fun speak(text: String, promise: Promise) {
        mainHandler.post {
            try {
                if (textToSpeech == null || !isTtsInitialized) {
                    promise.reject("TTS_NOT_READY", "TextToSpeech engine is not initialized")
                    return@post
                }
                val utteranceId = "OdinEyeVoice_" + System.currentTimeMillis()
                textToSpeech?.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
                promise.resolve(utteranceId)
            } catch (e: Exception) {
                promise.reject("TTS_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun stopSpeaking(promise: Promise) {
        mainHandler.post {
            try {
                textToSpeech?.stop()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("TTS_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun isSpeaking(promise: Promise) {
        mainHandler.post {
            try {
                val speaking = textToSpeech?.isSpeaking ?: false
                promise.resolve(speaking)
            } catch (e: Exception) {
                promise.resolve(false)
            }
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Double) {
        // Required for RN NativeEventEmitter
    }
}

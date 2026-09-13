package com.odineye.health.audio

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * OdinAudioModule
 * Exposes real-time audio synthesis and background audio controls to React Native.
 */
class OdinAudioModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "OdinAudioModule"
        private val audioEngine = OdinAudioEngine()
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun play(soundId: String, volume: Double, promise: Promise) {
        try {
            audioEngine.play(soundId, volume.toFloat())
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("AUDIO_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun setVolume(volume: Double, promise: Promise) {
        try {
            audioEngine.setVolume(volume.toFloat())
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("AUDIO_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        try {
            audioEngine.stop()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("AUDIO_ERROR", e.message, e)
        }
    }
}

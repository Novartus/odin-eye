package com.odineye.health.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.os.Build
import java.util.Random
import kotlin.math.PI
import kotlin.math.sin

/**
 * OdinAudioEngine
 * Real-time procedural audio synthesis engine for Android.
 * Streams mathematically pure frequencies, binaural beats, and colored noise
 * continuously on a dedicated background thread using AudioTrack.
 * Plays reliably even when the screen is dimmed or locked.
 */
class OdinAudioEngine {

    private var audioTrack: AudioTrack? = null
    private var isPlaying = false
    private var synthesisThread: Thread? = null

    @Volatile
    private var currentVolume = 0.65f

    @Volatile
    private var currentMode = "silent"

    private val sampleRate = 44100
    private val bufferSize = AudioTrack.getMinBufferSize(
        sampleRate,
        AudioFormat.CHANNEL_OUT_STEREO,
        AudioFormat.ENCODING_PCM_16BIT
    ).coerceAtLeast(sampleRate / 4)

    private val random = Random()

    fun play(soundId: String, volume: Float = 0.65f) {
        stop()
        currentMode = soundId
        currentVolume = volume.coerceIn(0f, 1f)

        if (soundId == "silent") return

        isPlaying = true

        val audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
            .build()

        val audioFormat = AudioFormat.Builder()
            .setSampleRate(sampleRate)
            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
            .setChannelMask(AudioFormat.CHANNEL_OUT_STEREO)
            .build()

        audioTrack = AudioTrack(
            audioAttributes,
            audioFormat,
            bufferSize,
            AudioTrack.MODE_STREAM,
            AudioManager.AUDIO_SESSION_ID_GENERATE
        )

        audioTrack?.play()

        synthesisThread = Thread({
            synthesizeLoop()
        }, "OdinAudioSynthesis").apply {
            priority = Thread.NORM_PRIORITY
            start()
        }
    }

    fun setVolume(volume: Float) {
        currentVolume = volume.coerceIn(0f, 1f)
    }

    fun stop() {
        isPlaying = false
        try {
            synthesisThread?.interrupt()
            synthesisThread?.join(300)
        } catch (_: Exception) {}
        synthesisThread = null

        try {
            audioTrack?.stop()
            audioTrack?.release()
        } catch (_: Exception) {}
        audioTrack = null
    }

    private fun synthesizeLoop() {
        val chunkSize = 2048
        val shortBuffer = ShortArray(chunkSize * 2) // Stereo: L, R interleaved
        var phaseL = 0.0
        var phaseR = 0.0

        // Noise synthesis state variables
        var brownL = 0.0
        var brownR = 0.0

        // Pink noise Paul Kellet filters (3-pole)
        var b0_L = 0.0; var b1_L = 0.0; var b2_L = 0.0
        var b0_R = 0.0; var b1_R = 0.0; var b2_R = 0.0

        // Ocean wave LFO phase
        var waveLfoPhase = 0.0

        // Determine generator parameters
        val (freqL, freqR, isBinaural, isBrown, isPink, isWhite, isOcean, isBreeze) = when (currentMode) {
            "hz432" -> TupleConfig(432.0, 432.0, false, false, false, false, false, false)
            "hz528" -> TupleConfig(528.0, 528.0, false, false, false, false, false, false)
            "hz639" -> TupleConfig(639.0, 639.0, false, false, false, false, false, false)
            "gamma40" -> TupleConfig(200.0, 240.0, true, false, false, false, false, false) // 40Hz beat
            "alpha10" -> TupleConfig(200.0, 210.0, true, false, false, false, false, false) // 10Hz beat
            "theta6" -> TupleConfig(150.0, 156.0, true, false, false, false, false, false)  // 6Hz beat
            "delta2" -> TupleConfig(100.0, 102.0, true, false, false, false, false, false)  // 2Hz beat
            "brown_noise" -> TupleConfig(0.0, 0.0, false, true, false, false, false, false)
            "pink_noise" -> TupleConfig(0.0, 0.0, false, false, true, false, false, false)
            "white_noise" -> TupleConfig(0.0, 0.0, false, false, false, true, false, false)
            "waves" -> TupleConfig(0.0, 0.0, false, false, false, false, true, false)
            "breeze" -> TupleConfig(0.0, 0.0, false, false, false, false, false, true)
            "rain" -> TupleConfig(0.0, 0.0, false, false, true, false, false, false) // Rain uses organic pink noise base
            "birds" -> TupleConfig(432.0, 432.0, false, false, false, false, false, false)
            else -> TupleConfig(432.0, 432.0, false, false, false, false, false, false)
        }

        val phaseIncL = 2.0 * PI * freqL / sampleRate
        val phaseIncR = 2.0 * PI * freqR / sampleRate
        val waveLfoInc = 2.0 * PI * 0.12 / sampleRate // ~8.3 second breathing wave cycle

        while (isPlaying) {
            val vol = currentVolume * 0.7f // gentle master ceiling to prevent clipping

            for (i in 0 until chunkSize) {
                var sampleL = 0.0
                var sampleR = 0.0

                if (isBrown) {
                    // Brownian random walk with leakage to avoid DC drift
                    val whiteL = (random.nextDouble() * 2.0 - 1.0)
                    val whiteR = (random.nextDouble() * 2.0 - 1.0)
                    brownL = (brownL + (0.02 * whiteL)) / 1.02
                    brownR = (brownR + (0.02 * whiteR)) / 1.02
                    sampleL = brownL * 3.5
                    sampleR = brownR * 3.5
                } else if (isPink || currentMode == "rain") {
                    val whiteL = (random.nextDouble() * 2.0 - 1.0)
                    val whiteR = (random.nextDouble() * 2.0 - 1.0)
                    b0_L = 0.99886 * b0_L + whiteL * 0.0555179
                    b1_L = 0.99332 * b1_L + whiteL * 0.0750759
                    b2_L = 0.96900 * b2_L + whiteL * 0.1538520
                    sampleL = (b0_L + b1_L + b2_L + whiteL * 0.5362) * 0.35

                    b0_R = 0.99886 * b0_R + whiteR * 0.0555179
                    b1_R = 0.99332 * b1_R + whiteR * 0.0750759
                    b2_R = 0.96900 * b2_R + whiteR * 0.1538520
                    sampleR = (b0_R + b1_R + b2_R + whiteR * 0.5362) * 0.35
                } else if (isWhite) {
                    sampleL = (random.nextDouble() * 2.0 - 1.0) * 0.4
                    sampleR = (random.nextDouble() * 2.0 - 1.0) * 0.4
                } else if (isOcean) {
                    // Modulated pink noise swell
                    val waveSwell = (sin(waveLfoPhase) + 1.0) * 0.5
                    waveLfoPhase += waveLfoInc
                    if (waveLfoPhase > 2.0 * PI) waveLfoPhase -= 2.0 * PI

                    val whiteL = (random.nextDouble() * 2.0 - 1.0)
                    val whiteR = (random.nextDouble() * 2.0 - 1.0)
                    brownL = (brownL + (0.03 * whiteL)) / 1.03
                    brownR = (brownR + (0.03 * whiteR)) / 1.03
                    val swellAmp = (0.2 + 0.8 * (waveSwell * waveSwell))
                    sampleL = brownL * 3.0 * swellAmp
                    sampleR = brownR * 3.0 * swellAmp
                } else if (isBreeze) {
                    // Soft filtered fluctuating breeze
                    val whiteL = (random.nextDouble() * 2.0 - 1.0)
                    val whiteR = (random.nextDouble() * 2.0 - 1.0)
                    brownL = (brownL + (0.015 * whiteL)) / 1.015
                    brownR = (brownR + (0.015 * whiteR)) / 1.015
                    sampleL = brownL * 2.2
                    sampleR = brownR * 2.2
                } else {
                    // Pure Sine / Binaural beat synthesis
                    sampleL = sin(phaseL)
                    sampleR = if (isBinaural) sin(phaseR) else sampleL

                    phaseL += phaseIncL
                    if (phaseL > 2.0 * PI) phaseL -= 2.0 * PI

                    if (isBinaural) {
                        phaseR += phaseIncR
                        if (phaseR > 2.0 * PI) phaseR -= 2.0 * PI
                    }
                }

                val finalL = (sampleL.coerceIn(-1.0, 1.0) * vol * Short.MAX_VALUE).toInt().toShort()
                val finalR = (sampleR.coerceIn(-1.0, 1.0) * vol * Short.MAX_VALUE).toInt().toShort()

                shortBuffer[i * 2] = finalL
                shortBuffer[i * 2 + 1] = finalR
            }

            if (isPlaying && audioTrack != null) {
                audioTrack?.write(shortBuffer, 0, shortBuffer.size)
            }
        }
    }

    private data class TupleConfig(
        val freqL: Double,
        val freqR: Double,
        val isBinaural: Boolean,
        val isBrown: Boolean,
        val isPink: Boolean,
        val isWhite: Boolean,
        val isOcean: Boolean,
        val isBreeze: Boolean
    )
}

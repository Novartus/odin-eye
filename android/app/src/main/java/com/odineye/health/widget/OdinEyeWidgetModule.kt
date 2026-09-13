package com.odineye.health.widget

import android.content.Context
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * OdinEyeWidgetModule
 * Exposes widget update routines and pending action checks to React Native.
 */
class OdinEyeWidgetModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "OdinEyeWidgetModule"
        const val PREFS_NAME = "odineye_widget_prefs"
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun updatePillWidget(
        medName: String,
        dosage: String,
        time: String,
        status: String,
        isTaken: Boolean,
        doseId: String,
        promise: Promise
    ) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit()
                .putString("pill_med_name", medName)
                .putString("pill_dosage", dosage)
                .putString("pill_time", time)
                .putString("pill_status", status)
                .putBoolean("pill_is_taken", isTaken)
                .putString("pill_dose_id", doseId)
                .apply()

            PillReminderWidgetProvider.updateAllWidgets(reactContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("WIDGET_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun updateZenWidget(
        steps: Int,
        stepGoal: Int,
        heartRate: Int,
        streakDays: Int,
        promise: Promise
    ) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit()
                .putInt("zen_steps", steps)
                .putInt("zen_step_goal", stepGoal)
                .putInt("zen_heart_rate", heartRate)
                .putInt("zen_streak_days", streakDays)
                .apply()

            ZenVitalsWidgetProvider.updateAllWidgets(reactContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("WIDGET_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getPendingWidgetActions(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val pendingDoseId = prefs.getString("pending_taken_id", null)
            val result = Arguments.createMap()

            if (pendingDoseId != null) {
                result.putString("action", "TAKE_PILL")
                result.putString("doseId", pendingDoseId)
                result.putDouble("timestamp", prefs.getLong("last_taken_timestamp", 0).toDouble())

                // Clear the pending action so it's only processed once
                prefs.edit().remove("pending_taken_id").apply()
            } else {
                result.putNull("action")
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("WIDGET_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getRequestedTab(promise: Promise) {
        try {
            val intentTab = currentActivity?.intent?.getStringExtra("open_tab")
            if (intentTab != null) {
                currentActivity?.intent?.removeExtra("open_tab")
                promise.resolve(intentTab)
                return
            }
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val requestedTab = prefs.getString("requested_tab", null)
            if (requestedTab != null) {
                prefs.edit().remove("requested_tab").apply()
                promise.resolve(requestedTab)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.resolve(null)
        }
    }
}

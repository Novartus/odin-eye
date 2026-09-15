package com.odineye.health.notification

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.Calendar

/**
 * OdinEyeNotificationModule
 * React Native Turbo/Bridge Module for scheduling native Android exact alarms
 * and managing lockscreen medication reminder notifications.
 */
class OdinEyeNotificationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val MODULE_NAME = "OdinEyeNotificationModule"
        private const val TAG = "OdinEyeNotificationMod"
        private const val PREFS_NAME = "odineye_scheduled_alarms"
    }

    override fun getName(): String = MODULE_NAME

    init {
        // Ensure channel is created on module load
        OdinEyeAlarmReceiver.createNotificationChannel(reactContext)
    }

    /**
     * Check if notifications are enabled for this app at the system OS level
     */
    @ReactMethod
    fun areNotificationsEnabled(promise: Promise) {
        try {
            val enabled = NotificationManagerCompat.from(reactContext).areNotificationsEnabled()
            promise.resolve(enabled)
        } catch (e: Exception) {
            promise.reject("ERR_CHECK_NOTIFS", e.message)
        }
    }

    /**
     * Check if exact alarms can be scheduled (Android 12+ / API 31+)
     */
    @ReactMethod
    fun canScheduleExactAlarms(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
                val canSchedule = alarmManager?.canScheduleExactAlarms() ?: true
                promise.resolve(canSchedule)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("ERR_CHECK_EXACT_ALARM", e.message)
        }
    }

    /**
     * Open system App Notification Settings so the user can easily allow notifications
     */
    @ReactMethod
    fun openNotificationSettings(promise: Promise) {
        try {
            val intent = Intent().apply {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    action = Settings.ACTION_APP_NOTIFICATION_SETTINGS
                    putExtra(Settings.EXTRA_APP_PACKAGE, reactContext.packageName)
                } else {
                    action = "android.settings.APP_NOTIFICATION_SETTINGS"
                    putExtra("app_package", reactContext.packageName)
                    putExtra("app_uid", reactContext.applicationInfo.uid)
                }
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_OPEN_SETTINGS", e.message)
        }
    }

    /**
     * Schedule a recurring daily exact alarm for a specific medication dose time
     */
    @ReactMethod
    fun scheduleMedicationAlarm(
        medId: String,
        title: String,
        body: String,
        timeStr: String,
        hour: Int,
        minute: Int,
        promise: Promise
    ) {
        try {
            val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            if (alarmManager == null) {
                promise.reject("ERR_NO_ALARM_MGR", "AlarmManager not available")
                return
            }

            // Calculate target trigger time
            val cal = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, hour)
                set(Calendar.MINUTE, minute)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
                // If scheduled time has already passed today, schedule for tomorrow
                if (timeInMillis <= System.currentTimeMillis()) {
                    add(Calendar.DAY_OF_YEAR, 1)
                }
            }

            val alarmIntent = Intent(reactContext, OdinEyeAlarmReceiver::class.java).apply {
                action = OdinEyeAlarmReceiver.ACTION_MEDICATION_ALARM
                putExtra("med_id", medId)
                putExtra("title", title)
                putExtra("body", body)
                putExtra("time_str", timeStr)
                putExtra("hour", hour)
                putExtra("minute", minute)
            }

            val pendingIntent = PendingIntent.getBroadcast(
                reactContext,
                medId.hashCode(),
                alarmIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            OdinEyeAlarmReceiver.scheduleAlarmSafe(alarmManager, cal.timeInMillis, pendingIntent)

            // Save to persistent SharedPreferences for device reboot recovery
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val serialized = "$medId|$title|$body|$timeStr|$hour|$minute"
            prefs.edit().putString(medId, serialized).apply()

            Log.d(TAG, "Successfully scheduled alarm for $medId at ${cal.time} (epoch: ${cal.timeInMillis})")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error scheduling alarm: ${e.message}")
            promise.reject("ERR_SCHEDULE_ALARM", e.message)
        }
    }

    /**
     * Cancel an alarm for a specific medication ID
     */
    @ReactMethod
    fun cancelMedicationAlarm(medId: String, promise: Promise) {
        try {
            val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            val intent = Intent(reactContext, OdinEyeAlarmReceiver::class.java).apply {
                action = OdinEyeAlarmReceiver.ACTION_MEDICATION_ALARM
            }
            val pendingIntent = PendingIntent.getBroadcast(
                reactContext,
                medId.hashCode(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            alarmManager?.cancel(pendingIntent)

            // Remove from SharedPreferences
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().remove(medId).apply()

            Log.d(TAG, "Cancelled alarm for $medId")
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_CANCEL_ALARM", e.message)
        }
    }

    /**
     * Cancel all active scheduled medication alarms
     */
    @ReactMethod
    fun cancelAllAlarms(promise: Promise) {
        try {
            val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val all = prefs.all

            for ((key, _) in all) {
                val intent = Intent(reactContext, OdinEyeAlarmReceiver::class.java).apply {
                    action = OdinEyeAlarmReceiver.ACTION_MEDICATION_ALARM
                }
                val pendingIntent = PendingIntent.getBroadcast(
                    reactContext,
                    key.hashCode(),
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                alarmManager?.cancel(pendingIntent)
            }

            prefs.edit().clear().apply()
            Log.d(TAG, "Cancelled all (${all.size}) alarms")
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_CANCEL_ALL_ALARMS", e.message)
        }
    }

    /**
     * Send an immediate or quick test notification to demonstrate lockscreen Heads-Up banner
     */
    @ReactMethod
    fun sendTestNotification(title: String, body: String, delaySeconds: Int, promise: Promise) {
        try {
            val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            val triggerAt = System.currentTimeMillis() + (delaySeconds * 1000L)

            val intent = Intent(reactContext, OdinEyeAlarmReceiver::class.java).apply {
                action = OdinEyeAlarmReceiver.ACTION_MEDICATION_ALARM
                putExtra("med_id", "test_alert_${System.currentTimeMillis()}")
                putExtra("title", title)
                putExtra("body", body)
                putExtra("time_str", "Now")
            }

            val pendingIntent = PendingIntent.getBroadcast(
                reactContext,
                999999,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            if (delaySeconds <= 0) {
                reactContext.sendBroadcast(intent)
            } else if (alarmManager != null) {
                OdinEyeAlarmReceiver.scheduleAlarmSafe(alarmManager, triggerAt, pendingIntent)
            }

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_SEND_TEST_NOTIF", e.message)
        }
    }
}

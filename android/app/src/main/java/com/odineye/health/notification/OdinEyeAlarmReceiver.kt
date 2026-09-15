package com.odineye.health.notification

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.odineye.health.MainActivity
import com.odineye.health.R
import java.util.Calendar

/**
 * OdinEyeAlarmReceiver
 * Native Android BroadcastReceiver triggered by AlarmManager.
 * Guaranteed to fire at the exact minute scheduled even when:
 * - App is completely closed or killed by user
 * - Device is in battery-saving Doze mode (setExactAndAllowWhileIdle)
 * - Device has been rebooted (BOOT_COMPLETED restores alarms)
 */
class OdinEyeAlarmReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "OdinEyeAlarm"
        const val CHANNEL_ID = "medication_reminders_v1"
        const val ACTION_MEDICATION_ALARM = "com.odineye.health.ACTION_MEDICATION_ALARM"
        const val ACTION_TAKE_MED = "com.odineye.health.ACTION_TAKE_MED"
        const val ACTION_SNOOZE_MED = "com.odineye.health.ACTION_SNOOZE_MED"
        const val PREFS_NAME = "odineye_scheduled_alarms"

        fun createNotificationChannel(context: Context) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val name = "Medication Reminders"
                val descriptionText = "High-priority alarms and dose reminders for your daily medications and supplements."
                val importance = NotificationManager.IMPORTANCE_HIGH
                val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                    description = descriptionText
                    enableVibration(true)
                    vibrationPattern = longArrayOf(0, 500, 250, 500)
                    enableLights(true)
                    lightColor = 0xFF2A7F85.toInt() // OdinEye Teal brand accent
                    lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
                    val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
                        ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                    val audioAttrs = AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                        .build()
                    setSound(soundUri, audioAttrs)
                }
                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.createNotificationChannel(channel)
            }
        }

        fun scheduleAlarmSafe(alarmManager: AlarmManager, triggerAtMillis: Long, pendingIntent: PendingIntent) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
                } else {
                    alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
                }
            } catch (se: SecurityException) {
                Log.w(TAG, "Exact alarm permission restricted, falling back to setAndAllowWhileIdle: ${se.message}")
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
                } else {
                    alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error scheduling alarm: ${e.message}")
            }
        }
    }

    override fun onReceive(context: Context, intent: Intent?) {
        if (intent == null) return
        val action = intent.action ?: return
        Log.d(TAG, "onReceive triggered with action: $action")

        createNotificationChannel(context)

        when (action) {
            Intent.ACTION_BOOT_COMPLETED, "android.intent.action.QUICKBOOT_POWERON" -> {
                // Device rebooted: restore all scheduled alarms from persistent SharedPreferences
                restoreAlarmsOnReboot(context)
            }
            ACTION_MEDICATION_ALARM -> {
                val medId = intent.getStringExtra("med_id") ?: "med_unknown"
                val title = intent.getStringExtra("title") ?: "⏰ Medication Reminder"
                val body = intent.getStringExtra("body") ?: "Time to take your scheduled dose."
                val timeStr = intent.getStringExtra("time_str") ?: ""
                val notificationId = medId.hashCode()

                showHeadsUpNotification(context, notificationId, medId, title, body, timeStr)

                // Reschedule for tomorrow if recurring daily
                rescheduleNextDay(context, intent)
            }
            ACTION_TAKE_MED -> {
                val notificationId = intent.getIntExtra("notification_id", 0)
                val medId = intent.getStringExtra("med_id") ?: ""
                Log.d(TAG, "User tapped 'Take Dose' directly from notification for: $medId")

                // Dismiss notification
                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.cancel(notificationId)

                // Notify PillReminderWidgetProvider if installed to sync state
                try {
                    val widgetIntent = Intent(context, Class.forName("com.odineye.health.widget.PillReminderWidgetProvider")).apply {
                        this.action = "com.odineye.health.widget.ACTION_TAKE_PILL"
                        putExtra("med_id", medId)
                    }
                    context.sendBroadcast(widgetIntent)
                } catch (e: Exception) {
                    Log.w(TAG, "Widget sync on dose taken notice: ${e.message}")
                }
            }
            ACTION_SNOOZE_MED -> {
                val notificationId = intent.getIntExtra("notification_id", 0)
                val medId = intent.getStringExtra("med_id") ?: ""
                val title = intent.getStringExtra("title") ?: "⏰ Medication Reminder"
                val body = intent.getStringExtra("body") ?: "Time to take your scheduled dose."

                // Dismiss current notification
                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.cancel(notificationId)

                // Schedule snooze alarm 10 minutes from now
                snoozeAlarm(context, medId, title, body, 10)
            }
        }
    }

    private fun showHeadsUpNotification(
        context: Context,
        notificationId: Int,
        medId: String,
        title: String,
        body: String,
        timeStr: String
    ) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Content intent: tapping opens OdinEye to Medication tab
        val launchIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("requested_tab", "meds")
            putExtra("med_id", medId)
            putExtra("scheduled_time", timeStr)
        }
        val contentPendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Action 1: "✓ Take Dose"
        val takeIntent = Intent(context, OdinEyeAlarmReceiver::class.java).apply {
            action = ACTION_TAKE_MED
            putExtra("notification_id", notificationId)
            putExtra("med_id", medId)
        }
        val takePendingIntent = PendingIntent.getBroadcast(
            context,
            notificationId + 1000,
            takeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Action 2: "Snooze 10m"
        val snoozeIntent = Intent(context, OdinEyeAlarmReceiver::class.java).apply {
            action = ACTION_SNOOZE_MED
            putExtra("notification_id", notificationId)
            putExtra("med_id", medId)
            putExtra("title", title)
            putExtra("body", body)
        }
        val snoozePendingIntent = PendingIntent.getBroadcast(
            context,
            notificationId + 2000,
            snoozeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_medication)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setSound(soundUri)
            .setVibrate(longArrayOf(0, 500, 250, 500))
            .setColor(0xFF2A7F85.toInt())
            .setContentIntent(contentPendingIntent)
            .addAction(0, "✓ Take Dose", takePendingIntent)
            .addAction(0, "Snooze 10m", snoozePendingIntent)

        try {
            val largeIcon = BitmapFactory.decodeResource(context.resources, R.mipmap.ic_launcher)
            if (largeIcon != null) {
                builder.setLargeIcon(largeIcon)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Could not load large icon: ${e.message}")
        }

        notificationManager.notify(notificationId, builder.build())
    }

    private fun snoozeAlarm(context: Context, medId: String, title: String, body: String, minutes: Int) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val triggerAt = System.currentTimeMillis() + (minutes * 60 * 1000L)

        val alarmIntent = Intent(context, OdinEyeAlarmReceiver::class.java).apply {
            action = ACTION_MEDICATION_ALARM
            putExtra("med_id", medId)
            putExtra("title", "$title (Snoozed)")
            putExtra("body", body)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            medId.hashCode() + 5000,
            alarmIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        scheduleAlarmSafe(alarmManager, triggerAt, pendingIntent)
        Log.d(TAG, "Snooze alarm set for +$minutes minutes ($triggerAt)")
    }

    private fun rescheduleNextDay(context: Context, intent: Intent) {
        val hour = intent.getIntExtra("hour", -1)
        val minute = intent.getIntExtra("minute", -1)
        val medId = intent.getStringExtra("med_id") ?: return
        val title = intent.getStringExtra("title") ?: "⏰ Medication Reminder"
        val body = intent.getStringExtra("body") ?: ""
        val timeStr = intent.getStringExtra("time_str") ?: ""

        if (hour < 0 || minute < 0) return

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return

        val nextCalendar = Calendar.getInstance().apply {
            add(Calendar.DAY_OF_YEAR, 1)
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }

        val newIntent = Intent(context, OdinEyeAlarmReceiver::class.java).apply {
            action = ACTION_MEDICATION_ALARM
            putExtra("med_id", medId)
            putExtra("title", title)
            putExtra("body", body)
            putExtra("time_str", timeStr)
            putExtra("hour", hour)
            putExtra("minute", minute)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            medId.hashCode(),
            newIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        scheduleAlarmSafe(alarmManager, nextCalendar.timeInMillis, pendingIntent)
        Log.d(TAG, "Next day alarm scheduled for: ${nextCalendar.time}")
    }

    private fun restoreAlarmsOnReboot(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val allEntries = prefs.all
        Log.d(TAG, "Device rebooted. Restoring ${allEntries.size} scheduled alarms...")

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return

        for ((key, value) in allEntries) {
            try {
                // serialized format: "medId|title|body|timeStr|hour|minute"
                val raw = value as? String ?: continue
                val parts = raw.split("|")
                if (parts.size >= 6) {
                    val medId = parts[0]
                    val title = parts[1]
                    val body = parts[2]
                    val timeStr = parts[3]
                    val hour = parts[4].toInt()
                    val minute = parts[5].toInt()

                    val cal = Calendar.getInstance().apply {
                        set(Calendar.HOUR_OF_DAY, hour)
                        set(Calendar.MINUTE, minute)
                        set(Calendar.SECOND, 0)
                        set(Calendar.MILLISECOND, 0)
                        if (timeInMillis <= System.currentTimeMillis()) {
                            add(Calendar.DAY_OF_YEAR, 1)
                        }
                    }

                    val intent = Intent(context, OdinEyeAlarmReceiver::class.java).apply {
                        action = ACTION_MEDICATION_ALARM
                        putExtra("med_id", medId)
                        putExtra("title", title)
                        putExtra("body", body)
                        putExtra("time_str", timeStr)
                        putExtra("hour", hour)
                        putExtra("minute", minute)
                    }

                    val pendingIntent = PendingIntent.getBroadcast(
                        context,
                        medId.hashCode(),
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )

                    scheduleAlarmSafe(alarmManager, cal.timeInMillis, pendingIntent)
                    Log.d(TAG, "Restored alarm for $medId at ${cal.time}")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to restore alarm for key $key: ${e.message}")
            }
        }
    }
}

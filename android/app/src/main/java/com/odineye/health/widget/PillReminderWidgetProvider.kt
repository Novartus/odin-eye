package com.odineye.health.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.widget.RemoteViews
import com.odineye.health.MainActivity
import com.odineye.health.R

/**
 * PillReminderWidgetProvider
 * Android Home Screen Widget for OdinEye Medication Reminders.
 * Supports direct "Take" action from the home screen and deep link to Meds tab.
 */
class PillReminderWidgetProvider : AppWidgetProvider() {

    companion object {
        const val PREFS_NAME = "odineye_widget_prefs"
        const val ACTION_TAKE_PILL = "com.odineye.health.widget.ACTION_TAKE_PILL"
        const val ACTION_OPEN_MEDS = "com.odineye.health.widget.ACTION_OPEN_MEDS"

        fun updateAllWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, PillReminderWidgetProvider::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
            val provider = PillReminderWidgetProvider()
            for (widgetId in appWidgetIds) {
                provider.updateAppWidget(context, appWidgetManager, widgetId)
            }
        }
    }

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        if (intent.action == ACTION_TAKE_PILL) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val currentDoseId = prefs.getString("pill_dose_id", "daily_dose") ?: "daily_dose"

            prefs.edit()
                .putBoolean("pill_is_taken", true)
                .putString("pill_status", "Taken")
                .putString("pending_taken_id", currentDoseId)
                .putLong("last_taken_timestamp", System.currentTimeMillis())
                .apply()

            updateAllWidgets(context)
        }
    }

    fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        val medName = prefs.getString("pill_med_name", "Vitamin D3") ?: "Vitamin D3"
        val dosage = prefs.getString("pill_dosage", "2,000 IU · 1 capsule") ?: "2,000 IU · 1 capsule"
        val scheduledTime = prefs.getString("pill_time", "08:00 AM") ?: "08:00 AM"
        val isTaken = prefs.getBoolean("pill_is_taken", false)

        val views = RemoteViews(context.packageName, R.layout.widget_pill_reminder_4x2)

        views.setTextViewText(R.id.widget_med_title, medName)
        views.setTextViewText(R.id.widget_med_dosage, dosage)
        views.setTextViewText(R.id.widget_med_time, scheduledTime)

        if (isTaken) {
            views.setTextViewText(R.id.widget_take_btn_text, "✓ Taken")
            views.setTextViewText(R.id.widget_status_badge, "COMPLETED")
        } else {
            views.setTextViewText(R.id.widget_take_btn_text, "Take")
            views.setTextViewText(R.id.widget_status_badge, "UPCOMING")
        }

        // Tap on Take button -> Broadcast to mark dose taken
        val pendingFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }

        val takeIntent = Intent(context, PillReminderWidgetProvider::class.java).apply {
            action = ACTION_TAKE_PILL
        }
        val takePendingIntent = PendingIntent.getBroadcast(context, 101, takeIntent, pendingFlags)
        views.setOnClickPendingIntent(R.id.widget_take_btn, takePendingIntent)

        // Tap on widget card -> Open app to Meds tab
        val launchIntent = Intent(context, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            putExtra("open_tab", "meds")
        }
        val launchPendingIntent = PendingIntent.getActivity(context, 102, launchIntent, pendingFlags)
        views.setOnClickPendingIntent(R.id.widget_card_container, launchPendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}

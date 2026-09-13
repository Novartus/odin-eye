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
 * ZenVitalsWidgetProvider
 * Android Home Screen Widget for OdinEye Zen Streak, Mindfulness & Daily Vitals.
 * Displays real-time steps, heart rate, current mindfulness streak, and quick-launch Breathe button.
 */
class ZenVitalsWidgetProvider : AppWidgetProvider() {

    companion object {
        const val PREFS_NAME = "odineye_widget_prefs"

        fun updateAllWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, ZenVitalsWidgetProvider::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
            val provider = ZenVitalsWidgetProvider()
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

    fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        val steps = prefs.getInt("zen_steps", 7420)
        val stepGoal = prefs.getInt("zen_step_goal", 10000)
        val heartRate = prefs.getInt("zen_heart_rate", 64)
        val streakDays = prefs.getInt("zen_streak_days", 3)

        val views = RemoteViews(context.packageName, R.layout.widget_zen_vitals_4x2)

        views.setTextViewText(R.id.widget_steps_value, String.format("%,d", steps))
        views.setTextViewText(R.id.widget_steps_sub, "/ ${String.format("%,d", stepGoal)} steps")
        views.setTextViewText(R.id.widget_hr_value, "$heartRate bpm")
        views.setTextViewText(R.id.widget_streak_value, "$streakDays d streak")

        val progressPercent = if (stepGoal > 0) ((steps.toFloat() / stepGoal) * 100).toInt().coerceIn(0, 100) else 0
        views.setProgressBar(R.id.widget_step_progress, 100, progressPercent, false)

        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }

        // Tap on "Breathe" button -> Open app directly to Zen tab
        val zenIntent = Intent(context, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("open_tab", "zen")
        }
        val zenPendingIntent = PendingIntent.getActivity(context, 201, zenIntent, flags)
        views.setOnClickPendingIntent(R.id.widget_breathe_btn, zenPendingIntent)

        // Tap on widget card -> Open app to Home / Zen tab
        val cardIntent = Intent(context, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("open_tab", "zen")
        }
        val cardPendingIntent = PendingIntent.getActivity(context, 202, cardIntent, flags)
        views.setOnClickPendingIntent(R.id.widget_card_container, cardPendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}

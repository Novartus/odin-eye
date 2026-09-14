package com.odineye.health

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager
import com.odineye.health.audio.OdinAudioModule
import com.odineye.health.notification.OdinEyeNotificationModule
import com.odineye.health.widget.OdinEyeWidgetModule

/**
 * OdinEyeNativePackage
 * Registers native audio synthesis, notification alarm, and widget modules for React Native.
 */
class OdinEyeNativePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(
            OdinAudioModule(reactContext),
            OdinEyeWidgetModule(reactContext),
            OdinEyeNotificationModule(reactContext)
        )
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<View, ReactShadowNode<*>>> {
        return emptyList()
    }
}

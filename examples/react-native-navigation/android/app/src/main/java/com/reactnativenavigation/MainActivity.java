package com.reactnativenavigation;

import com.reactnativenavigation.NavigationActivity;

public class MainActivity extends NavigationActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "ReactNativeNavigation";
    }
}

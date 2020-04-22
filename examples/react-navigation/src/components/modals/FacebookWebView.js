import React, { useCallback, useRef, forwardRef, useState } from 'react';
import {
  Image,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { Modalize } from 'react-native-modalize';
import { WebView as RNWebView } from 'react-native-webview';

const { width, height: initialHeight } = Dimensions.get('window');

const extractHostname = url => {
  let hostname;

  if (url.indexOf('//') > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }

  hostname = hostname.split(':')[0];
  hostname = hostname.split('?')[0];

  return hostname;
};

const useCombinedRefs = (...refs) =>
  useCallback(
    element =>
      refs.forEach(ref => {
        if (!ref) {
          return;
        }

        if (typeof ref === 'function') {
          return ref(element);
        }

        ref.current = element;
      }),
    refs,
  );

export const FacebookWebView = forwardRef((_, ref) => {
  const modalizeRef = useRef(null);
  const webviewRef = useRef(null);
  const combinedRef = useCombinedRefs(ref, modalizeRef);
  const [url, setUrl] = useState('');
  const [secured, setSecure] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [back, setBack] = useState(false);
  const [forward, setForward] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const [height, setHeight] = useState(initialHeight);

  const handleClose = () => {
    if (modalizeRef.current) {
      modalizeRef.current.close();
    }
  };

  const handleLoad = status => {
    setMounted(true);

    if (status === 'progress' && !mounted) {
      return;
    }

    const toValue = status === 'start' ? 0.2 : status === 'progress' ? 0.5 : 1;

    Animated.timing(progress, {
      toValue,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    if (status === 'end') {
      Animated.timing(progress, {
        toValue: 2,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => {
        progress.setValue(0);
      });
    }
  };

  const handleNavigationStateChange = ({ url, canGoBack, canGoForward }) => {
    setBack(canGoBack);
    setForward(canGoForward);
    setSecure(url.includes('https'));
    setUrl(extractHostname(url));
  };

  const handleBack = () => {
    if (webviewRef.current) {
      webviewRef.current.goBack();
    }
  };

  const handleForward = () => {
    if (webviewRef.current) {
      webviewRef.current.goForward();
    }
  };

  const handleLayout = ({ layout }) => {
    setHeight(layout.height);
  };

  const renderHeader = () => (
    <View style={s.header}>
      <View style={s.header__wrapper}>
        <TouchableOpacity style={s.header__close} onPress={handleClose} activeOpacity={0.75}>
          <Image source={require('../../assets/cross.png')} />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ opacity: back ? 1 : 0.2 }}
          onPress={handleBack}
          disabled={!back}
          activeOpacity={0.75}
        >
          <Image source={require('../../assets/arrow.png')} />
        </TouchableOpacity>

        <View style={s.header__center}>
          {secured && (
            <Image style={{ tintColor: '#31a14c' }} source={require('../../assets/lock.png')} />
          )}
          <Text
            style={[s.header__url, { color: secured ? '#31a14c' : '#5a6266' }]}
            numberOfLines={1}
          >
            {url}
          </Text>
        </View>

        <TouchableOpacity
          style={[s.header__arrowRight, { opacity: forward ? 1 : 0.2 }]}
          onPress={handleForward}
          disabled={!forward}
          activeOpacity={0.75}
        >
          <Image source={require('../../assets/arrow.png')} />
        </TouchableOpacity>

        <TouchableOpacity disabled>
          <Image source={require('../../assets/dots.png')} />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          s.header__progress,
          {
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 0.2, 0.5, 1, 2],
                  outputRange: [-width, -width + 80, -width + 220, 0, 0],
                }),
              },
            ],
            opacity: progress.interpolate({
              inputRange: [0, 0.1, 1, 2],
              outputRange: [0, 1, 1, 0],
            }),
          },
        ]}
      />
    </View>
  );

  return (
    <Modalize
      ref={combinedRef}
      HeaderComponent={renderHeader}
      scrollViewProps={{ showsVerticalScrollIndicator: false }}
      onLayout={handleLayout}
    >
      <RNWebView
        ref={webviewRef}
        source={{ uri: 'https://github.com/jeremybarbet/react-native-modalize' }}
        onLoadStart={() => handleLoad('start')}
        onLoadProgress={() => handleLoad('progress')}
        onLoadEnd={() => handleLoad('end')}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        showsVerticalScrollIndicator={false}
        containerStyle={{ paddingBottom: 10 }}
        style={{ height }}
      />
    </Modalize>
  );
});

const s = StyleSheet.create({
  header: {
    height: 44,

    borderBottomColor: '#c1c4c7',
    borderBottomWidth: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },

  header__wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,

    paddingHorizontal: 12,

    height: '100%',
  },

  header__close: {
    marginRight: 25,
  },

  header__center: {
    flexDirection: 'row',
    alignItems: 'center',

    marginLeft: 'auto',
  },

  header__url: {
    marginLeft: 4,

    fontSize: 16,
    fontWeight: '500',
  },

  header__arrowRight: {
    marginLeft: 'auto',
    marginRight: 25,

    transform: [{ rotate: '180deg' }],
  },

  header__progress: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    backgroundColor: '#f6f7f9',

    opacity: 0,

    transform: [
      {
        translateX: -width,
      },
    ],
  },
});

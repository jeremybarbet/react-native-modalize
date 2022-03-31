"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
const devices_1 = require("./utils/devices");
const { height } = react_native_1.Dimensions.get('window');
exports.default = react_native_1.StyleSheet.create({
    modalize: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 9998,
    },
    modalize__wrapper: {
        flex: 1,
    },
    modalize__content: {
        zIndex: 5,
        marginTop: 'auto',
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    handle: {
        position: 'absolute',
        top: -20,
        right: 0,
        left: 0,
        zIndex: 5,
        paddingBottom: 20,
        height: 20,
    },
    handleBottom: {
        top: 0,
    },
    handle__shape: {
        alignSelf: 'center',
        top: 8,
        width: 45,
        height: 5,
        borderRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    handle__shapeBottom: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 0,
        height: devices_1.isWeb ? height : undefined,
    },
    overlay__background: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
    },
    content__container: {
        flex: 1,
        flexGrow: 1,
        flexShrink: 1,
    },
    content__adjustHeight: {
        flex: devices_1.isWeb ? 1 : 0,
        flexGrow: devices_1.isWeb ? undefined : 0,
        flexShrink: devices_1.isWeb ? undefined : 1,
    },
});

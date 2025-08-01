import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useConstructionData } from '@/utils/useConstructionData';
import { useAutocomplete } from '@/utils/useAutocomplete';
import { useHtmlBuilder } from '@/utils/useHtmlBuilder';
import { useRouter } from 'expo-router';
import { styles } from '@/styles/styles';
import { initDb } from '@/utils/db';

// Web-specific imports
let ReactNativeComponents: any = null;
let Slider: any = null;
let WebView: any = null;
let Animated: any = null;
let useSharedValue: any = null;
let useAnimatedStyle: any = null;
let withTiming: any = null;

if (Platform.OS !== 'web') {
    // Only import React Native components on native platforms
    const ReactNative = require('react-native');
    const SliderModule = require('@react-native-community/slider');
    const WebViewModule = require('react-native-webview');
    const ReanimatedModule = require('react-native-reanimated');
    
    ReactNativeComponents = ReactNative;
    Slider = SliderModule.default;
    WebView = WebViewModule.default;
    Animated = ReanimatedModule.default;
    useSharedValue = ReanimatedModule.useSharedValue;
    useAnimatedStyle = ReanimatedModule.useAnimatedStyle;
    withTiming = ReanimatedModule.withTiming;
}

// Web-compatible notifications
const configureNotificationHandler = () => {
    if (Platform.OS !== 'web') {
        const { configureNotificationHandler: configureNative } = require('@/utils/notifications');
        configureNative();
    }
};

const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
        const { requestPermissions: requestNative } = require('@/utils/notifications');
        await requestNative();
    }
};

const registerBackgroundTask = () => {
    if (Platform.OS !== 'web') {
        const { registerBackgroundTask: registerNative } = require('@/utils/backgroundTasks');
        registerNative();
    }
};

// Web-specific components
const WebMap = ({ html, loadingHtml }: { html: string; loadingHtml: boolean }) => {
    const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (mapContainer && !loadingHtml && html) {
            // Clear previous content
            mapContainer.innerHTML = '';
            
            // Create an iframe to properly isolate the map environment
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.backgroundColor = 'transparent';
            iframe.style.pointerEvents = 'auto'; // Ensure iframe can receive interactions
            
            // Set the HTML content as the iframe source
            const blob = new Blob([html], { type: 'text/html' });
            iframe.src = URL.createObjectURL(blob);
            
            // Add the iframe to the container
            mapContainer.appendChild(iframe);
            
            // Clean up the blob URL when component unmounts
            return () => {
                URL.revokeObjectURL(iframe.src);
            };
        }
    }, [html, loadingHtml, mapContainer]);

    if (loadingHtml) {
        return (
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                backgroundColor: '#f0f0f0'
            }}>
                <div>Loading map...</div>
            </div>
        );
    }

    return (
        <div 
            ref={setMapContainer}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative'
            }}
        />
    );
};

const WebSlider = ({ value, onChange, min, max, step }: { 
    value: number; 
    onChange: (value: number) => void; 
    min: number; 
    max: number; 
    step: number; 
}) => (
    <div style={{ marginTop: 10 }}>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{ width: '100%' }}
        />
    </div>
);

const WebButton = ({ onPress, children, style }: { 
    onPress: () => void; 
    children: React.ReactNode; 
    style?: React.CSSProperties; 
}) => (
    <button 
        onClick={onPress}
        style={{
            backgroundColor: '#1976D2',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            ...style
        }}
    >
        {children}
    </button>
);

const WebTextInput = ({ 
    placeholder, 
    value, 
    onChangeText, 
    style 
}: { 
    placeholder: string; 
    value: string; 
    onChangeText: (text: string) => void; 
    style?: React.CSSProperties; 
}) => (
    <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '10px',
            ...style
        }}
    />
);

export default function MapScreen() {
    const { entraves, impacts } = useConstructionData();
    const [fromQuery, setFromQuery] = useState('');
    const [toQuery, setToQuery] = useState('');
    const [activeInput, setActiveInput] = useState<'from' | 'to' | null>(null);
    const [fromCoord, setFromCoord] = useState<[number, number] | null>(null);
    const [toCoord, setToCoord] = useState<[number, number] | null>(null);
    const [distanceThreshold, setDistanceThreshold] = useState(100);
    const router = useRouter();
    const [visible, setVisible] = useState(false);

    const suggestions = useAutocomplete(
        activeInput === 'from' ? fromQuery : toQuery,
        activeInput !== null
    );

    const { html, loadingHtml } = useHtmlBuilder({
        entraves,
        impacts,
        fromCoord,
        toCoord,
        distanceThreshold,
    });

    useEffect(() => {
        configureNotificationHandler();
        requestPermissions();
        registerBackgroundTask();
        initDb();
    }, []);

    // Web-specific render
    if (Platform.OS === 'web') {
        return (
            <div style={{ 
                height: '100vh', 
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Floating button */}
                <div style={{ 
                    position: 'absolute', 
                    top: 20, 
                    left: 20, 
                    zIndex: 1000 
                }}>
                    <WebButton onPress={() => setVisible(!visible)}>
                        {visible ? 'Hide' : 'Show'}
                    </WebButton>
                </div>

                                 {/* Map */}
                 <div style={{ flex: 1, position: 'relative', pointerEvents: 'auto' }}>
                     <WebMap html={html} loadingHtml={loadingHtml} />
                 </div>

                {/* Bottom button */}
                <div style={{ 
                    position: 'absolute', 
                    bottom: 20, 
                    left: 20, 
                    right: 20, 
                    zIndex: 1000 
                }}>
                    <WebButton 
                        onPress={() => router.push('/SavedAddressesScreen')}
                        style={{ width: '100%' }}
                    >
                        Explorer les chantiers
                    </WebButton>
                </div>

                                 {/* Search overlay */}
                 <div style={{
                     position: 'absolute',
                     top: 0,
                     left: 0,
                     right: 0,
                     height: '80%',
                     opacity: visible ? 1 : 0,
                     transform: `translateY(${visible ? 0 : '-20px'})`,
                     transition: 'opacity 0.3s, transform 0.3s',
                     pointerEvents: visible ? 'auto' : 'none',
                     zIndex: 999 // Lower than the floating button
                 }}>
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        padding: '20px',
                        margin: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                                                 <WebTextInput
                             placeholder="From address"
                             value={fromQuery}
                             onChangeText={(t) => {
                                 setFromQuery(t);
                                 setActiveInput('from');
                                 setFromCoord(null);
                             }}
                         />
                         <WebTextInput
                             placeholder="To address"
                             value={toQuery}
                             onChangeText={(t) => {
                                 setToQuery(t);
                                 setActiveInput('to');
                                 setToCoord(null);
                             }}
                         />
                        
                        <div style={{ marginTop: 10 }}>
                            <div>Rayon d'affichage des entraves : {distanceThreshold} m</div>
                            <WebSlider
                                value={distanceThreshold}
                                onChange={setDistanceThreshold}
                                min={50}
                                max={600}
                                step={5}
                            />
                        </div>

                        {suggestions.length > 0 && (
                            <div style={{
                                maxHeight: '200px',
                                overflowY: 'auto',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                marginTop: '10px'
                            }}>
                                                                 {suggestions.map((item) => (
                                     <div
                                         key={item.properties.id}
                                         onClick={() => {
                                             if (activeInput === 'from') {
                                                 setFromQuery(item.properties.label);
                                                 setFromCoord(item.geometry.coordinates);
                                             } else {
                                                 setToQuery(item.properties.label);
                                                 setToCoord(item.geometry.coordinates);
                                             }
                                             setActiveInput(null);
                                         }}
                                        style={{
                                            padding: '10px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #eee',
                                            backgroundColor: 'white'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'white';
                                        }}
                                    >
                                        {item.properties.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Native render (existing code)
    const {
        View,
        TextInput,
        FlatList,
        Text,
        TouchableOpacity,
        ActivityIndicator,
        SafeAreaView,
        Dimensions,
    } = ReactNativeComponents;

        const { useSafeAreaInsets } = require('react-native-safe-area-context');
    const { Button, Provider: PaperProvider } = require('react-native-paper');

    const insets = useSafeAreaInsets();
    const screenHeight = Dimensions.get('window').height;

    // Web-compatible animation values
    const opacity = useSharedValue ? useSharedValue(0) : { value: 0 };
    const translateY = useSharedValue ? useSharedValue(-20) : { value: -20 };

    // Web-compatible animated style
    const animatedStyle = useAnimatedStyle ? useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    })) : {};

    const toggle = () => {
        const toVisible = !visible;
        setVisible(toVisible);
        if (withTiming) {
            opacity.value = withTiming(toVisible ? 1 : 0, { duration: 300 });
            translateY.value = withTiming(toVisible ? 0 : -20, { duration: 300 });
        }
    };

    // Native-compatible map display
    const renderMap = () => {
        return loadingHtml ? (
            <ActivityIndicator style={{ flex: 1 }} size="large" color="#00ff00" />
        ) : (
            <WebView originWhitelist={['*']} source={{ html }} style={{ flex: 1 }} />
        );
    };

    // Native-compatible slider
    const renderSlider = () => {
        return (
            <View style={styles.sliderContainer}>
                <Text>Rayon d'affichage des entraves : {distanceThreshold} m</Text>
                {Slider && (
                    <Slider
                        minimumValue={50}
                        maximumValue={600}
                        step={5}
                        value={distanceThreshold}
                        onValueChange={setDistanceThreshold}
                    />
                )}
            </View>
        );
    };

    return (
        <PaperProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <View style={styles.floatingButton}>
                    <Button
                        mode="contained"
                        onPress={toggle}
                        buttonColor="#1976D2"
                        textColor="#ffffff"
                    >
                        {visible ? 'Hide' : 'Show'}
                    </Button>
                </View>

                {renderMap()}

                <View style={[styles.floatingBtnContainer, { bottom: insets.bottom + 10 }]}>
                    <Button
                        buttonColor="#1976D2"
                        textColor="white"
                        mode="contained"
                        onPress={() => router.push('/SavedAddressesScreen')}
                    >
                        Explorer les chantiers
                    </Button>
                </View>

                {/* Overlay with pointerEvents logic */}
                {Animated && (
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                width: '100%',
                                height: screenHeight * 0.8,
                                top: screenHeight * 0.03,
                            },
                            animatedStyle,
                        ]}
                        pointerEvents={visible ? 'box-none' : 'none'}
                    >
                        <View style={styles.searchContainer} pointerEvents="auto">
                            <TextInput
                                placeholder="From address"
                                value={fromQuery}
                                onChangeText={t => {
                                    setFromQuery(t);
                                    setActiveInput('from');
                                    setFromCoord(null);
                                }}
                                style={styles.input}
                            />
                            <TextInput
                                placeholder="To address"
                                value={toQuery}
                                onChangeText={t => {
                                    setToQuery(t);
                                    setActiveInput('to');
                                    setToCoord(null);
                                }}
                                style={styles.input}
                            />
                            {renderSlider()}

                            {suggestions.length > 0 && (
                                <FlatList
                                    data={suggestions}
                                    keyExtractor={item => item.properties.id}
                                    style={styles.suggestionsList}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (activeInput === 'from') {
                                                    setFromQuery(item.properties.label);
                                                    setFromCoord(item.geometry.coordinates);
                                                } else {
                                                    setToQuery(item.properties.label);
                                                    setToCoord(item.geometry.coordinates);
                                                }
                                                setActiveInput(null);
                                            }}
                                        >
                                            <Text style={styles.suggestion}>{item.properties.label}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            )}
                        </View>
                    </Animated.View>
                )}
            </SafeAreaView>
        </PaperProvider>
    );
}

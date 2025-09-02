import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import HomeScreen from './screens/HomeScreen';
import MetaDetalleScreen from './screens/MetaDetalleScreen';
import MisMetasScreen from './screens/MisMetasScreen';
import CrearMetaScreen from './screens/CrearMetaScreen';
import UserMenu from './components/UserMenu';
import AuthScreen from './screens/AuthScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Image, StatusBar, Text, View, Platform, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { toastConfig } from './config/ToastConfig';
import Boton from './components/Boton';

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

const isWeb = Platform.OS === 'web';
const maxContainerWidth = 1200; // ancho máximo de contenido en web

export default function App() {
  const apkUrl = "https://expo.dev/artifacts/eas/ntqqfUDSGt4TmtH7ykxcLC.tar.gz"; // reemplaza con la URL de tu APK

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <Stack.Navigator
              screenOptions={({ navigation, route }) => ({
                headerShown: true,
                headerTitle: '',
                headerTransparent: true,
                headerShadowVisible: false,
                headerRight: () => <UserMenu />,
                headerLeft: () => {
                  // En Home no mostramos el botón de volver
                  if (route.name === 'Home') return null;

                  return (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: isWeb ? maxContainerWidth : '100%',
                        marginHorizontal: isWeb ? 'auto' : 0,
                        paddingHorizontal: isWeb ? 20 : 0,
                      }}
                    >
                      {isWeb && (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
                          <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                      )}
                      <Image
                        source={require('./assets/goalicon.png')}
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                      />
                      <Text style={{ color: '#fff', marginLeft: 5, fontSize: 18, fontWeight: 'bold' }}>
                        GoalPlanning.IA
                      </Text>
                    </View>
                  );
                },
              })}
            >
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  headerLeft: () => null, // quita el logo en Home
                }}
              />
              <Stack.Screen name="CrearMeta" component={CrearMetaScreen} />
              <Stack.Screen name="MetaDetalle" component={MetaDetalleScreen} />
              <Stack.Screen name="Metas" component={MisMetasScreen} />
              <Stack.Screen name="Auth" component={AuthScreen} options={{ headerRight: () => null }} />
            </Stack.Navigator>
          </NavigationContainer>
          {/* Botón flotante para descargar APK solo en web */}
          {isWeb && (
            <Boton
              onPress={() => window.open(apkUrl, "_blank")}
              title='Download APK'
              style={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                backgroundColor: '#2575fc',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 30,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
            </Boton>
          )}
        </AuthProvider>
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </QueryClientProvider >
  );
}

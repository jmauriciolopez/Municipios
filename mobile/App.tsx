import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import OrdenesAsignadasScreen from './screens/OrdenesAsignadasScreen';
import OrdenDetalleScreen from './screens/OrdenDetalleScreen';
import CapturaEvidenciaScreen from './screens/CapturaEvidenciaScreen';
import PerfilScreen from './screens/PerfilScreen';

export type RootStackParamList = {
  Login: undefined;
  OrdenesAsignadas: undefined;
  OrdenDetalle: { ordenId: string };
  CapturaEvidencia: { ordenId: string };
  Perfil: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OrdenesAsignadas" component={OrdenesAsignadasScreen} />
        <Stack.Screen name="OrdenDetalle" component={OrdenDetalleScreen} />
        <Stack.Screen name="CapturaEvidencia" component={CapturaEvidenciaScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

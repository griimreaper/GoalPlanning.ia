import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ backgroundColor: '#333', borderLeftColor: '#4CAF50' }} // fondo dark
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ color: '#fff', fontWeight: 'bold' }}
      text2Style={{ color: '#ccc' }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ backgroundColor: '#333', borderLeftColor: '#F44336' }} // fondo dark
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ color: '#fff', fontWeight: 'bold' }}
      text2Style={{ color: '#ccc' }}
    />
  ),
};

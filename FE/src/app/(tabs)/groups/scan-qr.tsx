import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLOR } from '@/utils/constant';
import { useJoinGroup } from '@/api/hooks';
import { useCurrentApp } from '@/context/app.context';
import { useToast } from '@/context/toast.context';

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { appState } = useCurrentApp();
  const { showToast } = useToast();
  const { mutate: joinGroup, isPending: isJoining } = useJoinGroup();

  useEffect(() => {
    if (permission && !permission.granted) {
        requestPermission();
    }
  }, [permission]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Chúng tôi cần quyền truy cập camera để quét mã QR</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Cấp quyền</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned || isJoining) return;
    setScanned(true);

    // Data format expected: "splitfair://join-group?groupId=..." or just "groupId"
    let groupId = data;
    if (data.includes('groupId=')) {
        groupId = data.split('groupId=')[1];
    }

    // Basic validation (UUID check or length check could be added)
    if (!groupId) {
        Alert.alert("Lỗi", "Mã QR không hợp lệ", [
            { text: "Quét lại", onPress: () => setScanned(false) }
        ]);
        return;
    }

    if (!appState?.userId) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập", [
            { text: "OK", onPress: () => router.back() }
        ]);
        return;
    }

    // Call API to join
    joinGroup(
        { groupId, userId: appState.userId as string },
        {
            onSuccess: () => {
                showToast('success', 'Thành công', 'Đã tham gia nhóm thành công!');
                router.back(); // Go back to group list
            },
            onError: (err: any) => {
                Alert.alert(
                    "Thất bại", 
                    err.response?.data?.message || "Không thể tham gia nhóm.",
                    [{ text: "Quét lại", onPress: () => setScanned(false) }]
                );
            }
        }
    );
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
            barcodeTypes: ["qr"],
        }}
      />
      
      {/* Overlay UI */}
      <View style={styles.overlay}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>Quét mã QR</Text>
            <View style={{width: 30}} /> 
        </View>

        <View style={styles.scanFrameContainer}>
            <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.instruction}>Di chuyển camera đến mã QR để quét</Text>
        </View>

        {isJoining && (
            <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={APP_COLOR.ORANGE} />
                <Text style={styles.loadingText}>Đang tham gia nhóm...</Text>
            </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
    fontSize: 16,
  },
  button: {
    alignSelf: 'center',
    backgroundColor: APP_COLOR.ORANGE,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
      marginTop: 20,
      alignSelf: 'center',
  },
  closeText: {
      color: '#ccc',
      fontSize: 16,
  },
  
  // Overlay
  overlay: {
      flex: 1,
      justifyContent: 'space-between',
      paddingVertical: 50,
      paddingHorizontal: 20,
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
  },
  backBtn: {
      padding: 5,
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 20,
  },
  title: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
  },
  
  // Scan Frame
  scanFrameContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
  },
  scanFrame: {
      width: 250,
      height: 250,
      borderWidth: 0,
      borderColor: 'transparent',
      position: 'relative',
  },
  corner: {
      position: 'absolute',
      width: 30,
      height: 30,
      borderColor: APP_COLOR.ORANGE,
      borderWidth: 4,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  
  instruction: {
      color: 'white',
      marginTop: 20,
      fontSize: 14,
      opacity: 0.8,
  },

  // Loading
  loadingOverlay: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  loadingText: {
      color: 'white',
      marginTop: 10,
      fontSize: 16,
      fontWeight: '600',
  },
});

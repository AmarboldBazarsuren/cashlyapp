/**
 * Custom Alert Modal - Dark Theme
 * Alert.alert() солих
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';

const CustomAlert = ({ 
  visible, 
  onClose, 
  title, 
  message, 
  buttons = [],
  type = 'info'
}) => {
  const getIconConfig = () => {
    switch(type) {
      case 'success':
        return { name: 'checkmark-circle', color: COLORS.success };
      case 'error':
        return { name: 'close-circle', color: COLORS.danger };
      case 'warning':
        return { name: 'warning', color: COLORS.warning };
      default:
        return { name: 'information-circle', color: COLORS.info };
    }
  };

  const icon = getIconConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
            <Icon name={icon.name} size={48} color={icon.color} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => {
              const isDestructive = button.style === 'destructive';
              const isCancel = button.style === 'cancel';
              
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    button.onPress?.();
                    onClose();
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.button,
                    buttons.length === 1 && styles.buttonSingle,
                    isCancel && styles.buttonCancel,
                  ]}
                >
                  {isDestructive ? (
                    <LinearGradient
                      colors={[COLORS.danger, COLORS.dangerLight]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonTextDestructive}>
                        {button.text}
                      </Text>
                    </LinearGradient>
                  ) : isCancel ? (
                    <View style={styles.buttonCancelInner}>
                      <Text style={styles.buttonTextCancel}>{button.text}</Text>
                    </View>
                  ) : (
                    <LinearGradient
                      colors={[COLORS.gradientStart, COLORS.gradientMiddle]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>{button.text}</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonSingle: {
    flex: 1,
  },
  buttonCancel: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonCancelInner: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  buttonTextDestructive: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  buttonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

export default CustomAlert;
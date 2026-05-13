import { Modal, View, Pressable, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';

export function Confirm({
  visible,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
  destructive,
}: {
  visible: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}) {
  const p = useTheme();
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'flex-end',
          padding: 8,
        }}
      >
        <View
          style={{
            backgroundColor: p.surface,
            borderRadius: 14,
            overflow: 'hidden',
            marginBottom: 8,
          }}
        >
          <View
            style={{
              padding: 16,
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: p.border,
            }}
          >
            <Text
              style={{
                color: p.text,
                fontFamily: fontVariant('sans', 600),
                fontSize: 13,
              }}
            >
              {title}
            </Text>
            {body && (
              <Text
                style={{
                  color: p.text2,
                  fontSize: 12,
                  marginTop: 4,
                  textAlign: 'center',
                }}
              >
                {body}
              </Text>
            )}
          </View>
          <Pressable
            onPress={onConfirm}
            style={{ height: 50, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text
              style={{
                color: destructive ? p.error : p.accent.primary,
                fontFamily: fontVariant('sans', 600),
                fontSize: 17,
              }}
            >
              {confirmLabel}
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={onCancel}
          style={{
            backgroundColor: p.surface,
            borderRadius: 14,
            height: 50,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: p.accent.primary,
              fontFamily: fontVariant('sans', 700),
              fontSize: 17,
            }}
          >
            Cancel
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

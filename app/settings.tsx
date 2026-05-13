import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '@/features/settings/store';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { ScreenHeader } from '@/ui/primitives/ScreenHeader';
import { Stepper } from '@/ui/primitives/Stepper';
import { Segment } from '@/ui/primitives/Segment';
import { Button } from '@/ui/primitives/Button';

type ThemePref = 'light' | 'dark' | 'system';

export default function SettingsScreen() {
  const p = useTheme();
  const router = useRouter();
  const data = useSettingsStore((s) => s.data);
  const patch = useSettingsStore((s) => s.patch);

  const [name, setName] = useState(data?.ownerName ?? '');
  useEffect(() => {
    const t = setTimeout(() => {
      if ((data?.ownerName ?? '') !== name) {
        patch({ ownerName: name.trim() === '' ? null : name.trim() });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [name, data?.ownerName, patch]);

  if (!data) return null;

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScreenHeader title="Ajustes" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }}>
        <Section label="Perfil">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
            placeholderTextColor={p.text3}
            style={{
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: p.border,
              backgroundColor: p.surface,
              color: p.text,
              fontSize: 15,
            }}
          />
        </Section>

        <Section label="Metas semanales">
          <View
            style={{
              backgroundColor: p.surface,
              borderColor: p.border,
              borderWidth: 1,
              borderRadius: 14,
              padding: 14,
              gap: 14,
            }}
          >
            <Row label="Sesiones">
              <Stepper
                label="ses"
                value={data.weeklyGoalSessions}
                step={1}
                onChange={(v) => patch({ weeklyGoalSessions: Math.max(1, Math.round(v)) })}
              />
            </Row>
            <Row label="Minutos">
              <Stepper
                label="min"
                value={data.weeklyGoalMinutes}
                step={15}
                onChange={(v) =>
                  patch({ weeklyGoalMinutes: Math.max(15, Math.round(v / 15) * 15) })
                }
              />
            </Row>
            <Row label="Volumen">
              <Stepper
                label="kg"
                value={data.weeklyGoalVolumeKg}
                step={500}
                onChange={(v) =>
                  patch({ weeklyGoalVolumeKg: Math.max(500, Math.round(v / 500) * 500) })
                }
              />
            </Row>
          </View>
        </Section>

        <Section label="Apariencia">
          <Segment<ThemePref>
            value={(data.theme as ThemePref) ?? 'system'}
            onChange={(v) => patch({ theme: v })}
            options={[
              { value: 'light', label: 'Claro' },
              { value: 'dark', label: 'Oscuro' },
              { value: 'system', label: 'Sistema' },
            ]}
          />
        </Section>

        <Section label="Datos">
          <Button variant="outline" full disabled>
            Exportar JSON (próximamente)
          </Button>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  const p = useTheme();
  return (
    <View>
      <Text
        style={{
          color: p.text3,
          fontFamily: fontVariant('sans', 700),
          fontSize: 11,
          letterSpacing: 1,
          textTransform: 'uppercase',
          paddingHorizontal: 4,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const p = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Text
        style={{
          color: p.text,
          fontFamily: fontVariant('sans', 600),
          fontSize: 13,
          width: 90,
        }}
      >
        {label}
      </Text>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

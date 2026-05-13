import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Plus, X } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { ScreenHeader } from '@/ui/primitives/ScreenHeader';
import { Button } from '@/ui/primitives/Button';
import { Confirm } from '@/ui/primitives/Confirm';
import {
  useRoutine,
  useCreateRoutine,
  useRemoveRoutineItem,
  useArchiveRoutine,
} from '@/features/routines/hooks';

export default function RoutineEditScreen() {
  const p = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ? Number(params.id) : null;
  const isNew = id == null;

  if (isNew) return <NewRoutineForm />;
  return <EditRoutineForm id={id!} />;
}

function NewRoutineForm() {
  const p = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const create = useCreateRoutine();

  const canSave = name.trim().length > 0;

  const save = async () => {
    if (!canSave) return;
    try {
      const row = await create.mutateAsync(name.trim());
      router.replace({ pathname: '/routine/edit', params: { id: String(row.id) } });
    } catch (e) {
      Alert.alert('No se pudo crear', String(e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScreenHeader title="Nueva rutina" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <Field label="Nombre">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Empuje, Tirón, Pierna..."
            placeholderTextColor={p.text3}
            autoFocus
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
        </Field>
        <View style={{ marginTop: 8 }}>
          <Button onPress={save} disabled={!canSave} full>
            Crear
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

function EditRoutineForm({ id }: { id: number }) {
  const p = useTheme();
  const router = useRouter();
  const { data, isLoading } = useRoutine(id);
  const removeItem = useRemoveRoutineItem();
  const archive = useArchiveRoutine();
  const [confirmArchive, setConfirmArchive] = useState(false);

  if (isLoading || !data) {
    return (
      <View style={{ flex: 1, backgroundColor: p.bg }}>
        <ScreenHeader title="Editar rutina" onBack={() => router.back()} />
      </View>
    );
  }

  const items = data.items;

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScreenHeader
        title={data.name}
        onBack={() => router.back()}
        right={
          <Pressable onPress={() => router.back()}>
            <Text
              style={{
                color: p.accent.primary,
                fontFamily: fontVariant('sans', 700),
                fontSize: 15,
              }}
            >
              Guardar
            </Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <Field label="Nombre">
          <View
            style={{
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: p.border,
              backgroundColor: p.surface,
            }}
          >
            <Text style={{ color: p.text, fontSize: 15 }}>{data.name}</Text>
          </View>
        </Field>

        <View>
          <Text
            style={{
              color: p.text3,
              fontFamily: fontVariant('sans', 700),
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 8,
              paddingHorizontal: 4,
            }}
          >
            Ejercicios
          </Text>
          <View style={{ gap: 8 }}>
            {items.map((item) => (
              <View
                key={item.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  padding: 12,
                  borderRadius: 14,
                  backgroundColor: p.surface,
                  borderWidth: 1,
                  borderColor: p.border,
                }}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      color: p.text,
                      fontFamily: fontVariant('sans', 600),
                      fontSize: 14,
                    }}
                  >
                    {item.exerciseName}
                  </Text>
                  <Text
                    style={{
                      color: p.text3,
                      fontSize: 11,
                      marginTop: 2,
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.muscleGroup}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: fontVariant('numeric', 600),
                    fontSize: 13,
                    color: p.text2,
                  }}
                >
                  {item.targetSets}×{item.targetReps}
                  {item.targetWeightKg != null ? ` · ${item.targetWeightKg}kg` : ''}
                </Text>
                <Pressable
                  onPress={() =>
                    removeItem.mutate({ itemId: item.id, routineId: id })
                  }
                  hitSlop={8}
                >
                  <X size={16} color={p.text3} />
                </Pressable>
              </View>
            ))}

            <Pressable
              onPress={() => router.push(`/routine/${id}/add-item`)}
              style={{
                height: 44,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: p.border,
                borderStyle: 'dashed',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 6,
              }}
            >
              <Plus size={16} color={p.accent.primary} />
              <Text
                style={{
                  color: p.accent.primary,
                  fontFamily: fontVariant('sans', 700),
                  fontSize: 14,
                }}
              >
                Añadir ejercicio
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ marginTop: 8 }}>
          <Pressable
            onPress={() => setConfirmArchive(true)}
            style={{
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: p.error,
                fontFamily: fontVariant('sans', 600),
                fontSize: 15,
              }}
            >
              Archivar rutina
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <Confirm
        visible={confirmArchive}
        title="¿Archivar rutina?"
        body="Podrás restaurarla más tarde desde la lista."
        confirmLabel="Archivar"
        destructive
        onCancel={() => setConfirmArchive(false)}
        onConfirm={async () => {
          setConfirmArchive(false);
          await archive.mutateAsync(id);
          router.back();
        }}
      />
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
          marginBottom: 6,
          paddingHorizontal: 4,
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

import { View, StyleSheet, Text } from "react-native";
import { TextInput, IconButton, Button, HelperText } from "react-native-paper";
import { useState } from "react";
import { colors } from "@/theme/colors";
import { useSettingsStore } from "@/store/settingsStore";
import Toast from "react-native-toast-message";

export default function SettingsScreen() {
  const { accessToken, setAccessToken } = useSettingsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [tempToken, setTempToken] = useState(accessToken);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const validateToken = (token: string) => {
    if (!token.trim()) {
      return "Access token cannot be empty";
    }
    return "";
  };

  const handleSave = async () => {
    const validationError = validateToken(tempToken);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    try {
      setAccessToken(tempToken);
      setIsEditing(false);
      setError("");
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Access token updated successfully",
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save access token",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempToken(accessToken);
    setIsEditing(false);
    setError("");
  };

  // Mask token except last 4 characters
  const maskToken = (token: string) => {
    if (!token) return "";
    return "•".repeat(token.length - 4) + token.slice(-4);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.tokenContainer}>
          <TextInput
            label="Access Token"
            value={
              isEditing
                ? tempToken
                : showToken
                  ? accessToken
                  : maskToken(accessToken)
            }
            onChangeText={(text) => {
              setTempToken(text);
              setError("");
            }}
            style={styles.input}
            contentStyle={styles.inputContent}
            disabled={!isEditing || isSaving}
            error={!!error}
            textColor={colors.onSurface}
            multiline
            numberOfLines={2}
            mode="outlined"
            theme={{
              colors: {
                onSurfaceVariant: colors.onSurface, // Make label more visible
                placeholder: colors.onSurfaceVariant,
                text: colors.onSurface,
                primary: colors.primary,
                outline: colors.surfaceVariant,
              },
            }}
          />
          {error && (
            <HelperText type="error" style={styles.errorText}>
              {error}
            </HelperText>
          )}
          <View style={styles.buttonRow}>
            <IconButton
              icon={showToken ? "eye-off" : "eye"}
              mode="outlined"
              size={20}
              onPress={() => setShowToken(!showToken)}
              disabled={isEditing}
              iconColor={colors.onSurfaceVariant}
              style={styles.visibilityButton}
            />

            {!isEditing ? (
              <IconButton
                icon="pencil"
                mode="contained"
                size={20}
                containerColor={colors.primary}
                iconColor={colors.onPrimary}
                onPress={() => setIsEditing(true)}
              />
            ) : null}
          </View>
          {isEditing && (
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={handleCancel}
                style={styles.cancelButton}
                disabled={isSaving}
                textColor={colors.primary}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.saveButton}
                loading={isSaving}
                disabled={isSaving}
                textColor={colors.onPrimary}
              >
                Save
              </Button>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
  },
  tokenContainer: {
    width: "100%",
  },
  textLabel: {
    color: colors.onPrimary,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  input: {
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  inputContent: {
    minHeight: 64, // Consistent height
    paddingVertical: 8, // Better vertical padding
  },
  visibilityButton: {
    borderColor: colors.surfaceVariant,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 8,
  },
  cancelButton: {
    borderColor: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  errorText: {
    color: colors.error,
  },
});

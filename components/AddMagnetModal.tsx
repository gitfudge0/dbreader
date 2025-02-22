import { Modal, Portal, TextInput, Button } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import { useState } from "react";

export function AddMagnetModal({
  visible,
  onDismiss,
  onSubmit,
}: {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (magnet: string) => void;
}) {
  const [magnet, setMagnet] = useState("");

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <TextInput
          label="Magnet Link"
          value={magnet}
          onChangeText={setMagnet}
          mode="outlined"
          style={styles.input}
        />
        <View style={styles.buttonContainer}>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button
            mode="contained"
            onPress={() => {
              onSubmit(magnet);
              setMagnet("");
            }}
            disabled={!magnet.trim()}
          >
            Add
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: colors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  input: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
});

import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

interface FirstBounceModalProps {
  visible: boolean;
  onSelect: (runs: number) => void;
  onClose: () => void;
}

const { width } = Dimensions.get("window");

const FirstBounceModal: React.FC<FirstBounceModalProps> = ({
  visible,
  onSelect,
  onClose,
}) => {
  const scores = [0, 1, 2, 3, 4, 6];

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>1st Bounce - Select Runs</Text>
          <Text style={styles.subtitle}>Choose runs scored off the bat</Text>

          <View style={styles.scoresGrid}>
            {scores.map((score) => (
              <TouchableOpacity
                key={score}
                style={styles.scoreButton}
                onPress={() => onSelect(score)}
              >
                <Text style={styles.scoreText}>{score}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    maxWidth: 320,
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
  },
  scoresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  scoreButton: {
    backgroundColor: "#7c3aed",
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#a78bfa",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  cancelButton: {
    backgroundColor: "#374151",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  cancelText: {
    fontSize: 16,
    color: "#9ca3af",
    fontWeight: "600",
  },
});

export default FirstBounceModal;

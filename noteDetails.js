import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Image } from "react-native";
import { updateDoc, doc } from "firebase/firestore";
import { database } from "./firebase";
import * as ImagePicker from "expo-image-picker";
import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const NoteDetails = ({ route, navigation }) => {
  console.log("Note ID received:", noteId); // Add this line to log the received noteId
  const [note, setNote] = useState(route.params.note);
  const [isEditing, setIsEditing] = useState(false);
  const [imagePath, setImagePath] = useState(null);
  const { noteId } = route.params;

  useEffect(() => {
    downloadImage(); // Download the image when the component mounts (if imagePath exists)
  }, []);

  // Function to handle saving the note
  const handleSaveNote = async () => {
    try {
      // Update the note in Firebase Firestore
      const noteRef = doc(database, "Notes", noteId); // Use noteId here
      await updateDoc(noteRef, {
        header: note.header,
        body: note.body,
      });

      if (imagePath) {
        await uploadImage();
      }

      // Log and pass the updated note to the homepage
      console.log("Note saved successfully:", note);

      // Navigate back to the previous screen with the updated note
      navigation.navigate("My Notes", { updatedNote: note });
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  // Function to handle picking an image
  async function launchImagePicker() {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
      });
      if (!result.cancelled) {
        setImagePath(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  }

  async function uploadImage() {
    try {
      // Fetch the image data
      const resource = await fetch(imagePath);
      const blob = await resource.blob();
      const storageReference = ref(storage, `${noteId}.jpg`); // Use noteId here
      await uploadBytes(storageReference, blob);
      console.log("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }

  async function downloadImage() {
    try {
      const url = await getDownloadURL(ref(storage, `${noteId}.jpg`)); // Use noteId here
      setImagePath(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.noteHeader}
        value={note.header}
        onChangeText={(text) => setNote({ ...note, header: text })}
        editable={isEditing}
      />
      <TextInput
        style={styles.noteBody}
        multiline={true}
        value={note.body}
        onChangeText={(text) => setNote({ ...note, body: text })}
        editable={isEditing}
      />

      {imagePath && (
        <Image
          style={{ width: 200, height: 200 }}
          source={{ uri: imagePath }}
        />
      )}
      <Button
        title="Upload Image"
        style={{ marginBottom: 10 }}
        onPress={uploadImage}
      />
      <Button title="Pick Image" onPress={launchImagePicker} />

      <View style={styles.buttonContainer}>
        {isEditing ? (
          <Button title="Save" onPress={handleSaveNote} />
        ) : (
          <Button title="Edit" onPress={() => setIsEditing(true)} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  noteHeader: {
    fontSize: 18,
    fontWeight: "bold",
  },
  noteBody: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 10,
  },
});

export default NoteDetails;

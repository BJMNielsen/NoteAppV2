import { app, database } from "./firebase";
import NoteDetails from "./noteDetails";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/FontAwesome"; // You can use a different icon library if you prefer
import * as ImagePicker from "expo-image-picker";

export default function App() {
  const Stack = createNativeStackNavigator();

  // alert(JSON.stringify(app, null, 4)); Viser bare om vi har forbindelse til databasen

  return (
    //     You define two screens: "My Notes" and "Create New Note" using Stack.Screen.
    //     For each screen, you render a component (HomePage and AddNotePage, respectively) and pass navigation props.
    //
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="My Notes">
          {(props) => <HomePage {...props} />}
        </Stack.Screen>
        <Stack.Screen name="Create New Note">
          {(props) => (
            <AddNotePage
              {...props}
              onNoteAdded={(newNote) => {
                // Handle note added in parent component
                props.route.params?.onNoteAdded(newNote);
              }}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Note Details">
          {(props) => <NoteDetails {...props} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const HomePage = ({ navigation, route }) => {
  // local state variable to hold the notes' data
  const [notesData, setNotesData] = useState([]);

  //local state variable to check the loading status
  const [loading, setLoading] = useState(true); // We initialize the loading state as true, indicating that data is being loaded initially.

  // fetchData function fetches data from Firebase Firestore and updates the notesData state.
  // You can use getDocs to fetch the data and then use setNotesData to update the state.
  const fetchData = async () => {
    try {
      const currentDocumentData = await getDocs(collection(database, "Notes"));
      const data = currentDocumentData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      console.log("Fetched data:", data); // Add this line for debugging
      setNotesData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notes:", error);
      setLoading(false);
    }
  };

  const handleAddNote = (newNote) => {
    // Update the notes data when a new note is added
    setNotesData([...notesData, newNote]);
    console.log("Notes Data Updated:", [...notesData, newNote]);
  };

  // The useEffect hook in React is named that way because it's used to manage "side effects" in your components
  // Side effects are operations that are not part of the regular rendering of your component but are often necessary for tasks like data fetching, subscriptions, manually changing the DOM, and more.
  // By using useEffect, you can ensure that certain code runs after the component renders, making it easier to manage asynchronous and non-rendering tasks.

  useEffect(() => {
    fetchData();
  }, []);

  // Listen for changes to the updatedNote prop
  useEffect(() => {
    handleUpdatedNote(route.params?.updatedNote);
  }, [route.params?.updatedNote]);

  // Define a function to handle the updated note
  const handleUpdatedNote = (updatedNote) => {
    // Check if an updated note was passed in the route
    if (route.params?.updatedNote) {
      // Replace the updated note in the notesData state
      const updatedNoteIndex = notesData.findIndex(
        (note) => note.id === route.params.updatedNote.id
      );
      if (updatedNoteIndex !== -1) {
        const updatedNotesData = [...notesData];
        updatedNotesData[updatedNoteIndex] = route.params.updatedNote;
        setNotesData(updatedNotesData);
      }
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      if (!id) {
        console.error("Invalid ID. Cannot delete the note.");
        return;
      }

      console.log("Deleting note with ID:", id);

      const notesCollectionRef = collection(database, "Notes");
      await deleteDoc(doc(notesCollectionRef, id));

      // Log a message after successful deletion
      console.log("Note deleted successfully");

      // Fetch the updated data after deletion
      fetchData();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Create New Note", { onNoteAdded: handleAddNote })
        }
        style={styles.iconWrapper}
      >
        <Icon name="plus" style={styles.icon} />
      </TouchableOpacity>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={notesData}
          keyExtractor={(item) => item.id}
          style={{ marginBottom: 10 }}
          renderItem={({ item }) => {
            return (
              <View style={styles.noteContainer}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("Note Details", { note: item }) // vi giver item videre til note details siden, og kalder den note.
                    
                  }
                >
                  <Text style={styles.noteHeader}>{item.header}</Text>
                </TouchableOpacity>
                {item.imagePath && (
                  <Image
                    style={{ width: 50, height: 50 }}
                    source={{ uri: item.imagePath }}
                  />
                )}
                <Button
                  title="Delete"
                  onPress={() => handleDeleteNote(item.id)}
                />
              </View>
            );
          }}
        />
      )}

      <Button
        title="ADD NEW NOTE"
        onPress={() =>
          navigation.navigate("Create New Note", { onNoteAdded: handleAddNote })
        }
      />
    </View>
  );
};

// TODO: LAV EN UPDATE PÅ LISTEN NÅR DER ADDES EN NOTE, DU SKAL VISE DEN NYESTE DATA FRA FIREBASE PÅ LISTEN.
const AddNotePage = ({ navigation, route }) => {
  const [noteHeader, setNoteHeader] = useState("");
  const [noteBody, setNoteBody] = useState("");

  function buttonHandler() {
    console.log("Add Note Button Pressed");
    // Create a new note object
    const newNote = {
      header: noteHeader,
      body: noteBody,
      key: Date.now().toString(),
    };

    // When a note is added, you pass it back to the parent component (HomePage) using a callback function (onNoteAdded).
    //route.params?.onNoteAdded(newNote);

    // Call the onNoteAdded callback to pass the new note back to HomePage
    route.params?.onNoteAdded(newNote);

    // Clear the input fields
    setNoteHeader("");
    setNoteBody("");

    // Add the new note to your Firebase Firestore collection
    const notesCollectionRef = collection(database, "Notes"); // Vi siger den skal gemme i vores database, under collection "Notes".
    addDoc(notesCollectionRef, newNote) // vi adder et nyt document til vores collection.
      .then(() => {
        console.log("New note added to Firestore:", newNote);
      })
      .catch((error) => {
        console.error("Error adding new note to Firestore:", error);
      });

    // Navigate back to the homepage
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <TextInput
        onChangeText={(noteHeader) => setNoteHeader(noteHeader)}
        style={styles.textInputHeader}
        placeholder="Note overskrift"
      ></TextInput>

      <TextInput
        onChangeText={(noteBody) => setNoteBody(noteBody)}
        style={{ ...styles.textInputBody }}
        placeholder="Skriv din noter her"
        multiline={true}
      ></TextInput>

      <Button title="Add Note" onPress={buttonHandler}></Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 10,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "left",
  },
  noteContainer: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
  },
  noteHeader: {
    fontSize: 18,
    fontWeight: "bold",
  },
  textInputHeader: {
    borderRadius: 10,
    textAlignVertical: "top",
    backgroundColor: "#ECECEC",
    fontSize: 16,
    color: "#333",
    padding: 10,
    margin: 10,
    height: 40, // Adjust the height to make it smaller
  },
  textInputBody: {
    borderRadius: 10,
    textAlignVertical: "top",
    backgroundColor: "#ECECEC",
    fontSize: 16,
    color: "#333",
    padding: 10,
    margin: 10,
    height: 200,
  },
  iconWrapper: {
    alignSelf: "flex-end", // Align the wrapper to the right
  },
  icon: {
    fontSize: 30,
    color: "#6495ED",
  },
  buttonContainer: {
    alignSelf: "flex-end",
    marginLeft: "auto", // This pushes the button to the right side
  },
});

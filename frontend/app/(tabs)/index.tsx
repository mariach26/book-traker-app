import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity, Modal, TextInput, Button, Alert } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

// --- ΒΑΛΕ ΕΔΩ ΤΗΝ IP ΤΟΥ ΥΠΟΛΟΓΙΣΤΗ ΣΟΥ ---
const API_URL = "http://192.168.χ.χ:8000"; 

const CHART_DATA = {
  labels: ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαι', 'Ιουν'],
  datasets: [{ data: [1, 2, 1, 0, 3, 2] }], // Προς το παρόν στατικό, θα το φτιάξουμε μετά
};

export default function App() {
  const screenWidth = Dimensions.get('window').width;
  
  // States
  const [books, setBooks] = useState([]); // Εδώ αποθηκεύονται τα πραγματικά βιβλία
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newRating, setNewRating] = useState('');

  // Μόλις ανοίγει η εφαρμογή, φέρε τα βιβλία
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${API_URL}/books`);
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Σφάλμα φόρτωσης:", error);
    }
  };

  const handleAddBook = async () => {
    if (!newTitle || !newDate || !newRating) {
      Alert.alert("Προσοχή", "Παρακαλώ συμπλήρωσε όλα τα πεδία!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          finish_date: newDate,
          rating: newRating
        })
      });

      if (response.ok) {
        // Καθαρίζουμε και κλείνουμε το modal
        setNewTitle('');
        setNewDate('');
        setNewRating('');
        setModalVisible(false);
        
        // Ζητάμε πάλι τα βιβλία για να ανανεωθεί η λίστα αμέσως
        fetchBooks();
      }
    } catch (error) {
      console.error("Σφάλμα αποθήκευσης:", error);
      Alert.alert("Σφάλμα", "Δεν μπόρεσε να συνδεθεί στον server.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Τα Βιβλία μου</Text>

        {/* Κουμπί Προσθήκης */}
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Προσθήκη Βιβλίου</Text>
        </TouchableOpacity>

        {/* --- ΔΥΝΑΜΙΚΟ ΠΛΕΓΜΑ ΒΙΒΛΙΩΝ ΑΠΟ ΤΗ ΒΑΣΗ (ΑΝΤΙΣΤΡΑΜΜΕΝΟ) --- */}
        <View style={styles.gridContainer}>
          {[...(books || [])].reverse().map((book) => (
            <View key={book.id} style={styles.card}>
              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookText}>Λήξη: {book.finish_date}</Text>
              <Text style={styles.bookText}>Αξιολόγηση: {book.rating}/5</Text>
            </View>
          ))}
          {books.length === 0 && <Text style={{marginTop: 20}}>Δεν έχεις προσθέσει βιβλία ακόμα.</Text>}
        </View>

        {/* --- ΓΡΑΦΗΜΑ --- */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Διάγραμμα</Text>
          <BarChart
            data={CHART_DATA}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#f0f0f0',
              backgroundGradientTo: '#e0e0e0',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
            }}
            style={styles.chartStyle}
          />
        </View>
      </ScrollView>

      {/* --- MODAL ΠΡΟΣΘΗΚΗΣ --- */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Νέο Βιβλίο</Text>
            
            <TextInput style={styles.input} placeholder="Τίτλος Βιβλίου" value={newTitle} onChangeText={setNewTitle} />
            <TextInput style={styles.input} placeholder="Ημερομηνία (π.χ. 12/04)" value={newDate} onChangeText={setNewDate} />
            <TextInput style={styles.input} placeholder="Βαθμολογία (1-5)" keyboardType="numeric" value={newRating} onChangeText={setNewRating} />

            <View style={styles.modalButtons}>
              <Button title="Ακύρωση" color="red" onPress={() => setModalVisible(false)} />
              <Button title="Αποθήκευση" onPress={handleAddBook} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingTop: 50, paddingBottom: 50 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  addButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginHorizontal: 20, marginBottom: 20, alignItems: 'center' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', paddingHorizontal: 10 },
  card: { width: '45%', backgroundColor: '#f9f9f9', padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  bookTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  bookText: { fontSize: 14, color: '#555', marginBottom: 5 },
  chartContainer: { alignItems: 'center', marginTop: 30 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  chartStyle: { borderRadius: 16 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 15, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }
});
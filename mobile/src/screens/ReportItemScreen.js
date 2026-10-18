import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

const CATEGORIES = [
  'Electronics',
  'Bags & Luggage',
  'Accessories',
  'Personal Items',
  'Books & Stationery',
  'Sports Equipment',
  'Documents & Cards',
];

export default function ReportItemScreen({ route, navigation }) {
  const defaultType = route.params?.defaultType || 'lost';
  const { reportItem } = useApp();
  const { user } = useAuth();

  const [type, setType] = useState(defaultType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);

  // Native Geolocation
  const [locationCoords, setLocationCoords] = useState(null);
  const [locationLabel, setLocationLabel] = useState('Detecting location...');
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationLabel('Campus Main Building (GPS disabled)');
        setLocationCoords({ lat: 28.614, lng: 77.209 });
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocationCoords({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });

      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (geocode && geocode[0]) {
        const place = geocode[0];
        setLocationLabel(`${place.name || place.street || 'Campus Location'}, ${place.city || ''}`);
      } else {
        setLocationLabel(`Lat: ${loc.coords.latitude.toFixed(4)}, Lng: ${loc.coords.longitude.toFixed(4)}`);
      }
    } catch (e) {
      console.warn('Location detection failed:', e.message);
      setLocationLabel('Campus Main Library [Default]');
      setLocationCoords({ lat: 28.614, lng: 77.209 });
    } finally {
      setLocating(false);
    }
  };

  const handlePickImage = async (useCamera = false) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required to photograph items.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.6,
          base64: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.6,
          base64: true,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageBase64(`data:image/jpeg;base64,${asset.base64}`);
      }
    } catch (e) {
      Alert.alert('Image Error', e.message);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (idx) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Field', 'Please enter an item title.');
      return;
    }

    setSubmitting(true);
    const payload = {
      type,
      title: title.trim(),
      category,
      description: description.trim(),
      date: new Date().toISOString(),
      location: {
        lat: locationCoords ? locationCoords.lat : 28.614,
        lng: locationCoords ? locationCoords.lng : 77.209,
        label: locationLabel,
      },
      tags,
      images: imageBase64 ? [imageBase64] : [],
      reportedBy: {
        id: user?.id || 'mobile_user',
        name: user?.name || 'Mobile Student',
        role: user?.role || 'user',
      },
    };

    const res = await reportItem(payload);
    setSubmitting(false);

    if (res.success) {
      Alert.alert(
        'Report Filed Successfully! 🚀',
        `Your ${type.toUpperCase()} item report is registered. AI matching & geospatial checks are analyzing candidate items now.`,
        [
          {
            text: 'View Items',
            onPress: () => navigation.navigate('Browse'),
          },
        ]
      );
    } else {
      Alert.alert('Submission Error', res.error || 'Failed to submit report.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Type Toggle */}
      <View style={styles.typeToggle}>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'lost' && styles.typeBtnLost]}
          onPress={() => setType('lost')}
        >
          <Text style={[styles.typeText, type === 'lost' && styles.typeTextActive]}>
            🔴 I LOST SOMETHING
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'found' && styles.typeBtnFound]}
          onPress={() => setType('found')}
        >
          <Text style={[styles.typeText, type === 'found' && styles.typeTextActive]}>
            🟢 I FOUND SOMETHING
          </Text>
        </TouchableOpacity>
      </View>

      {/* Camera / Image Capture Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>1. Item Photograph (Native Camera / Gallery)</Text>
        {imageUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.changeImgBtn}
              onPress={() => handlePickImage(false)}
            >
              <Text style={styles.changeImgText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoActionsRow}>
            <TouchableOpacity
              style={styles.photoActionBtn}
              onPress={() => handlePickImage(true)}
            >
              <Text style={styles.photoActionIcon}>📷</Text>
              <Text style={styles.photoActionText}>Take Camera Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoActionBtn}
              onPress={() => handlePickImage(false)}
            >
              <Text style={styles.photoActionIcon}>🖼️</Text>
              <Text style={styles.photoActionText}>Upload from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Geolocation Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>2. Campus GPS Coordinates</Text>
        <View style={styles.locationRow}>
          <Text style={styles.locationText} numberOfLines={1}>
            {locating ? '📡 Acquiring GPS lock...' : `📍 ${locationLabel}`}
          </Text>
          <TouchableOpacity
            style={styles.refreshLocBtn}
            onPress={fetchCurrentLocation}
            disabled={locating}
          >
            <Text style={styles.refreshLocText}>{locating ? '...' : 'Refresh'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Details Form */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>3. Item Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title / Identifier</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Navy Blue Backpack, Casio Watch"
            placeholderTextColor={COLORS.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, category === cat && styles.catChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.catChipText,
                    category === cat && styles.catChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description & Distinguishing Marks</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Provide serial numbers, stickers, colors, internal contents..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Tags */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tags (Keywords)</Text>
          <View style={styles.tagInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="e.g. blue, dell, leather"
              placeholderTextColor={COLORS.textMuted}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={handleAddTag}
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={handleAddTag}>
              <Text style={styles.addTagBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((t, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.tagChip}
                  onPress={() => handleRemoveTag(idx)}
                >
                  <Text style={styles.tagChipText}>#{t} ✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitBtn,
          { backgroundColor: type === 'lost' ? COLORS.lostRed : COLORS.cyan },
        ]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#030712" />
        ) : (
          <Text style={[styles.submitBtnText, { color: type === 'lost' ? '#ffffff' : '#030712' }]}>
            Submit {type.toUpperCase()} Report
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  typeBtnLost: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: COLORS.lostRed,
  },
  typeBtnFound: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: COLORS.cyan,
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  typeTextActive: {
    color: '#ffffff',
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoActionBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceCard,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  photoActionIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  photoActionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  previewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
  },
  changeImgBtn: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
  },
  changeImgText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceCard,
    padding: 12,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.cyan,
    flex: 1,
    marginRight: 8,
  },
  refreshLocBtn: {
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  refreshLocText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  catScroll: {
    flexDirection: 'row',
  },
  catChip: {
    backgroundColor: COLORS.surfaceCard,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  catChipActive: {
    backgroundColor: COLORS.amber,
    borderColor: COLORS.amber,
  },
  catChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  catChipTextActive: {
    color: '#030712',
    fontWeight: 'bold',
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addTagBtn: {
    backgroundColor: COLORS.surfaceCard,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  addTagBtnText: {
    color: COLORS.cyan,
    fontWeight: 'bold',
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tagChip: {
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagChipText: {
    fontSize: 11,
    color: COLORS.cyan,
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

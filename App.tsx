// /**
//  * Main React Native App (Zustand Edition)
//  */
// import 'react-native-get-random-values';
// import 'react-native-url-polyfill/auto';
// import { NavigationContainer,useNavigationContainerRef } from '@react-navigation/native';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import React, { useEffect } from 'react';
// import { ActivityIndicator, View } from 'react-native';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { enableScreens } from 'react-native-screens';
// import AppNavigator from './src/app/navigation/AppNavigator';
// import AuthNavigator from './src/features/auth/AuthNavigator';
// import { useAuthStore } from './src/store/authStore';
// import { initDynamicLinks } from './src/utils/dynamicLinks';
// enableScreens();
// // ⚡ React Query client with conservative defaults to avoid auto-refetching
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 1000 * 60 * 5, // 5 minutes
//       gcTime: 1000 * 60 * 30, // 30 minutes
//       refetchOnMount: false,
//       refetchOnWindowFocus: false,
//       refetchOnReconnect: false,
//       retry: 1,
//     },
//     mutations: {
//       retry: 0,
//     },
//   },
// });
// const AuthGate = () => {
//   const { user, loading, initializeSession } = useAuthStore();
//   useEffect(() => {
//     initializeSession();
//   }, [initializeSession]);
//   if (loading) {
//     return (
//       <View
//         style={{
//           flex: 1,
//           justifyContent: 'center',
//           alignItems: 'center',
//           backgroundColor: '#fff',
//         }}
//       >
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }
//   const navigationRef = useNavigationContainerRef();
//   useEffect(() => {
//     // Wait for navigation to be ready
//     const unsubscribe = initDynamicLinks(navigationRef);
//     return unsubscribe;
//   }, []);
//   return (
//     <NavigationContainer ref={navigationRef}>
//       {user ? <AppNavigator /> : <AuthNavigator />}
//     </NavigationContainer>
//   );
// };
// const App = () => {
  



//   return (
//     <SafeAreaProvider>
//       <QueryClientProvider client={queryClient}>
//         <AuthGate />
//       </QueryClientProvider>
//     </SafeAreaProvider>
//   );
// };

// export default App;








// App.tsx

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import firestore from "@react-native-firebase/firestore";

// interface Item {
//   id: string;
//   name: string;
//   age: number;
// }

// const App = () => {
//   const [collectionName, setCollectionName] = useState(""); // dynamic table name
//   const [data, setData] = useState<Item[]>([]);
//   const [name, setName] = useState("");
//   const [age, setAge] = useState("");

//   // Fetch data when collectionName changes
//   useEffect(() => {
//     if (!collectionName) return;

//     const unsubscribe = firestore()
//       .collection(collectionName)
//       .onSnapshot((querySnapshot) => {
//         const items: Item[] = [];
//         querySnapshot.forEach((doc) => {
//           items.push({ id: doc.id, ...doc.data() } as Item);
//         });
//         setData(items);
//       });

//     return () => unsubscribe();
//   }, [collectionName]);

//   // Add record to selected collection
//   const addData = async () => {
//     if (!collectionName) {
//       Alert.alert("Error", "Please enter a table name first!");
//       return;
//     }
//     if (name === "" || age === "") {
//       Alert.alert("Error", "Please enter name and age!");
//       return;
//     }

//     await firestore().collection(collectionName).add({
//       name,
//       age: Number(age),
//     });

//     setName("");
//     setAge("");
//   };

//   // Delete record
//   const deleteData = async (id: string) => {
//     await firestore().collection(collectionName).doc(id).delete();
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Dynamic Firebase Table Creator</Text>

//       <TextInput
//         placeholder="Enter Table Name (e.g. users)"
//         value={collectionName}
//         onChangeText={setCollectionName}
//         style={styles.input}
//       />

//       <View style={styles.inputRow}>
//         <TextInput
//           placeholder="Name"
//           value={name}
//           onChangeText={setName}
//           style={styles.input}
//         />
//         <TextInput
//           placeholder="Age"
//           value={age}
//           onChangeText={setAge}
//           keyboardType="numeric"
//           style={styles.input}
//         />
//         <TouchableOpacity onPress={addData} style={styles.addButton}>
//           <Text style={styles.addButtonText}>Save</Text>
//         </TouchableOpacity>
//       </View>

//       {collectionName ? (
//         <FlatList
//           data={data}
//           keyExtractor={(item) => item.id}
//           renderItem={({ item }) => (
//             <View style={styles.row}>
//               <Text style={styles.cell}>{item.name}</Text>
//               <Text style={styles.cell}>{item.age}</Text>
//               <TouchableOpacity onPress={() => deleteData(item.id)}>
//                 <Text style={styles.deleteText}>Delete</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         />
//       ) : (
//         <Text style={{ textAlign: "center", marginTop: 20, color: "#888" }}>
//           Enter a table name to start
//         </Text>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 15,
//     textAlign: "center",
//   },
//   inputRow: { flexDirection: "row", marginBottom: 15 },
//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//     padding: 10,
//     marginRight: 10,
//   },
//   addButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 5 },
//   addButtonText: { color: "#fff", fontWeight: "bold" },
//   row: {
//     flexDirection: "row",
//     padding: 10,
//     borderBottomWidth: 1,
//     borderColor: "#ddd",
//     alignItems: "center",
//   },
//   cell: { flex: 1, fontSize: 16 },
//   deleteText: { color: "red", fontWeight: "bold" },
// });

// export default App;

















// import dynamicLinks from '@react-native-firebase/dynamic-links';
// import Share from 'react-native-share';
// import { Alert, Button, View, Text } from 'react-native';
// import React from 'react';
// export default function App() {
//   const createAndShareLink = async () => {
//     try {
//       const link = await dynamicLinks().buildShortLink({
//         link: 'https://yourwebsite.com/invite?ref=MARYAM123',
//         domainUriPrefix: 'https://yourappname.page.link', // :point_left: use the domain you just created
//         android: { packageName: 'com.adryd' },
//       });
//       await Share.open({
//         title: 'Invite your friends!',
//         message: `Join my app: ${link}`,
//       });
//     } catch (error) {
//       Alert.alert('Error', 'Could not create dynamic link');
//       console.error(error);
//     }
//   };
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Dynamic Links Example</Text>
//       <Button title="Create Dynamic Link" onPress={createAndShareLink} />
//     </View>
//   );
// }








import React, {useEffect} from 'react';
import {View, Text, Alert} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';

const App = () => {
	useEffect(() => {
		// Immediately-invoked async setup so we can await steps
		(async () => {
			try {
				// 1) Request permission
				const authStatus = await messaging().requestPermission();
				const enabled =
					authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
					authStatus === messaging.AuthorizationStatus.PROVISIONAL;
				if (enabled) console.log('Notification permission enabled');

				// 2) Get FCM token (useful for server-side testing)
				const fcmToken = await messaging().getToken();
				console.log('FCM Token:', fcmToken);

				// 3) Create channel and use returned id
				const channelId = await notifee.createChannel({
					id: 'default',
					name: 'Default Channel',
					importance: AndroidImportance.HIGH,
				});

				// 4) Display a local notification right away when the app opens
				//    (this gives a visible "push" effect on app start)
				await notifee.displayNotification({
					title: 'Welcome',
					body: 'App opened — notifications are enabled.',
					android: {
						channelId,
						importance: AndroidImportance.HIGH,
						// smallIcon: 'ic_launcher', // optional: ensure this resource exists
					},
				});

				// 5) If app was opened from a quit state by a notification, handle it
				const initialNotification = await messaging().getInitialNotification();
				if (initialNotification) {
					console.log('Opened from quit by notification:', initialNotification);
					Alert.alert(
						'Opened from notification',
						initialNotification.notification?.title ?? 'Opened via notification',
					);
				}
			} catch (err) {
				console.warn('Notification setup error', err);
			}
		})();

		// Foreground message listener: show notification when app is in foreground
		const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
			console.log('Foreground message:', remoteMessage);
			await notifee.displayNotification({
				title: remoteMessage.notification?.title,
				body: remoteMessage.notification?.body,
				android: {
					channelId: 'default',
					importance: AndroidImportance.HIGH,
				},
			});
		});

		// When the app is brought to foreground from background by tapping a notification
		const unsubscribeOpened = messaging().onNotificationOpenedApp(remoteMessage => {
			if (remoteMessage) {
				console.log('Notification caused app to open from background state:', remoteMessage);
				Alert.alert('Opened from notification', remoteMessage.notification?.title ?? '');
			}
		});

		// Cleanup listeners on unmount
		return () => {
			unsubscribeForeground();
			unsubscribeOpened();
		};
	}, []);

	return (
		<View style={{flex: 1, justifyContent: 'center', alignItems: 'center',}}>
			<Text>🚀 Firebase Push Notification Setup Done!</Text>
		</View>
	);
};

export default App;

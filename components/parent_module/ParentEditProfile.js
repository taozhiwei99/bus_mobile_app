//import libaries
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, 
  TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import { usernameValue } from '../Login';

//data objects
const ParentEditProfile = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [oldPasswordErrorMessage, setOldPasswordErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState("");
  const [successChangePassMessage, setSuccessChangePassMessage] = useState("");
  const [successUpdateProfileMessage, setSuccessUpdateProfileMessage] = useState("");
  const [showSuccessDetailsModal, setShowSuccessDetailsModal] = useState(false);
  const [showSuccessPassModal, setShowSuccessPassModal] = useState(false);

  // Display user data from userdata object
  useEffect(() => {
    const userID = usernameValue;
    //axio request to retrieve parent data
    axios
      .get(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/parent/${userID}`)
      .then((response) => {
        const userData = response.data;
        setName(userData.firstName + " " + userData.lastName);
        setUsername(userData.parent_ID);
        setEmail(userData.email);
        setContact(userData.contactNo);
        setAddress(userData.address);
      })
      .catch((error) => {
        console.log('Error fetching data', error);
      });
  }, []);

  //data object for new details
  const formValidationDetails = () => {
    setSuccessUpdateProfileMessage("");
    const userID = usernameValue;
    const newDetails = {
      parent_ID: userID,
      newContact: contact,
      newAddress: address,
    };
    //axios request to insert/update new details
    axios
      .put("https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/parent/updateDetails", newDetails)
      .then((response) => {
        setSuccessUpdateProfileMessage("Successfully updated profile");
        setShowSuccessDetailsModal(true);
      })
      .catch((error) => {
        console.log("Error during update profile", error);
      });
  };

  //reset message
  const toggleSuccessPassModal = () => {
    setShowSuccessPassModal(!showSuccessPassModal);
    setSuccessChangePassMessage(""); 
  };

  const toggleSuccessDetailsModal = () => {
    setShowSuccessDetailsModal(!showSuccessDetailsModal);
    setSuccessUpdateProfileMessage("");
  };

  //update password
  const formValidationPass = () => {
    setSuccessChangePassMessage("");
    const userID = usernameValue;
    axios
    //constantly getting latest password for user from database
      .get(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/parent/${userID}`)
      .then((response) => {
        const DBPassword = response.data.password;

        if (oldPassword !== DBPassword) {
          setOldPasswordErrorMessage("Old password is incorrect");
          return;
        }
        setOldPasswordErrorMessage("");

        if (!password && !confirmPassword) {
          setPasswordErrorMessage("Please enter new password");
          setConfirmPasswordErrorMessage("Please enter new password");
          return;
        }
        setPasswordErrorMessage("");
        setConfirmPasswordErrorMessage("");

        if (password !== confirmPassword) {
          setConfirmPasswordErrorMessage("Password does not match");
          return;
        }
        setConfirmPasswordErrorMessage("");

        //new password object
        const newPass = {
          parent_ID: userID,
          password: confirmPassword,
        };

        //send password update to user database
        axios
          .put("https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/parent/updatePass", newPass)
          .then((response) => {
            setSuccessChangePassMessage("Password changed successfully");
            setShowSuccessPassModal(true);
          })
          .catch((error) => {
            console.log("Error block in password", error);
          });
      })
      .catch((error) => {
        console.log("Error fetching data", error);
      });
  };

  //display
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 130 : 0}
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ScrollView style={styles.form}>
          <View style={styles.profileView}>
            <Text style={styles.title}>Profile Information</Text>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.uneditInput} value={name} onChangeText={setName} editable={false} />
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.uneditInput} value={email} onChangeText={setEmail} editable={false} />
            <Text style={styles.label}>Contact</Text>
            <TextInput style={styles.input} value={contact} onChangeText={setContact} />
            <Text style={styles.label}>Address</Text>
            <TextInput style={styles.input} value={address} onChangeText={setAddress} />
          </View>
          <TouchableOpacity onPress={formValidationDetails} style={styles.btn}>
            <Text style={styles.btnText}>Change Details</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Account Information</Text>
            <Text style={styles.label}>Username</Text>
            <TextInput style={styles.uneditInput} value={username} onChangeText={setUsername} editable={false} />
            <Text style={styles.label}>Old Password</Text>
            <TextInput style={styles.input} value={oldPassword} secureTextEntry={true} onChangeText={setOldPassword} />
            {oldPasswordErrorMessage.length > 0 && <Text style={styles.textDanger}>{oldPasswordErrorMessage}</Text>}
            <Text style={styles.label}>New Password</Text>
            <TextInput style={styles.input} value={password} secureTextEntry={true} onChangeText={setPassword} />
            {passwordErrorMessage.length > 0 && <Text style={styles.textDanger}>{passwordErrorMessage}</Text>}
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput style={styles.input} value={confirmPassword} secureTextEntry={true} onChangeText={setConfirmPassword} />
            {confirmPasswordErrorMessage.length > 0 && <Text style={styles.textDanger}>{confirmPasswordErrorMessage}</Text>}
          </View>
          <TouchableOpacity onPress={formValidationPass} style={styles.btn}>
            <Text style={styles.btnText}>Change Password</Text>
          </TouchableOpacity>
        </ScrollView>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showSuccessDetailsModal}
          onRequestClose={toggleSuccessDetailsModal}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{successUpdateProfileMessage}</Text>
            <TouchableOpacity onPress={toggleSuccessDetailsModal} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showSuccessPassModal}
          onRequestClose={toggleSuccessPassModal}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{successChangePassMessage}</Text>
            <TouchableOpacity onPress={toggleSuccessPassModal} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

//css styles
const styles = StyleSheet.create({
    title: {
        color: 'grey',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 30
    },
    form: {
        flex: 1,
        padding: 25,
        paddingTop: 0
    },
    profileView: {
        marginBottom: 16
    },
    label: {
        marginVertical: 16,
        marginBottom: 3,
        color: '#56844B',
        fontSize: 12,
        fontWeight: 'bold',
    },
    uneditInput: {
        padding: 8,
        backgroundColor: '#CCCCCC',
        borderRadius: 8,
        height: 40
    },
    input: {
        padding: 8,
        backgroundColor: '#E6E6E6',
        borderRadius: 8,
        height: 40
    },
    btn:{
        backgroundColor: '#56844B',
        borderRadius: 8,
        height:50,
        textAlign: 'auto',
        marginTop: 30,
    },
    btnText:{
        padding: 12,
        color: '#ffffff',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    textDanger: {
        color: "#dc3545"
    },
    textSuccess: {
        color: "#28a745"
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      modalText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 20,
        backgroundColor: '#56844B',
        borderRadius: 8,
        margin: 20,
      },
      modalButton: {
        backgroundColor: '#56844B',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
      },
      modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
      },
    });

export default ParentEditProfile;
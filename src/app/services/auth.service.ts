// author: Kevin Omar Yañez Bran
import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, collection, addDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import * as bcrypt from 'bcryptjs';
import { Observable } from 'rxjs';
import { docData } from 'rxfire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {}

  async registerUser(user: any) {
    try {
      // Cifrar contraseña y rol
      const hashedPassword = bcrypt.hashSync(user.password, 10);
      const hashedRole = bcrypt.hashSync(user.role, 10);

      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(this.auth, user.email, user.password);

      // Guardar usuario en Firestore
      await setDoc(doc(this.firestore, 'users', userCredential.user.uid), {
        email: user.email,
        username: user.username,
        password: hashedPassword,
        role: hashedRole,
        last_login: new Date()
      });

      return userCredential;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async loginUser(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const userDocRef = doc(this.firestore, 'users', userCredential.user.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        return { token: userCredential.user.uid, role: userData['role'] };
      } else {
        throw new Error('Usuario no encontrado');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getUserProfile(uid: string): Observable<any> {
    const userDocRef = doc(this.firestore, 'users', uid);
    return docData(userDocRef);
  }
}

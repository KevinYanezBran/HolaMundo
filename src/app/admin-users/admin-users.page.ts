// author: Kevin Omar Yañez Bran
import { Component, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, getDocs, addDoc, updateDoc, doc, DocumentData, query, where } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import * as bcrypt from 'bcryptjs';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
  standalone: false,
})
export class AdminUsersPage {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private ngZone = inject(NgZone);

  hasPermissions: boolean = false;
  users: any[] = [];
  newUser = { email: '', username: '', password: '', role: 'user' };
  selectedUser: any = null;

  constructor(private router: Router) {
    this.checkPermissions();
  }

  async checkPermissions() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.ngZone.runOutsideAngular(async () => {
          try {
            const usersCollection = collection(this.firestore, 'users');
            const q = query(usersCollection, where('id', '==', user.uid));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) return;

            const userData: DocumentData = querySnapshot.docs[0].data();
            const userRole = userData['role'];

            const rolesCollection = collection(this.firestore, 'roles');
            const roleQuery = query(rolesCollection, where('role', '==', userRole));
            const roleSnapshot = await getDocs(roleQuery);

            if (roleSnapshot.empty) return;

            const roleData: DocumentData = roleSnapshot.docs[0].data();
            let userPermissions = roleData['permissions'] as string[];

            userPermissions = userPermissions.map(perm => perm.trim().toLowerCase());

            const requiredPermissions = ["add_users", "delete_users", "update_users", "add_role", "delete_role", "update_role"];
            const normalizedRequiredPermissions = requiredPermissions.map(perm => perm.trim().toLowerCase());

            this.hasPermissions = normalizedRequiredPermissions.every((perm) => userPermissions.includes(perm));

            if (!this.hasPermissions) {
              this.ngZone.run(() => {
                alert("No tienes permisos para acceder a esta sección.");
                this.router.navigate(['/home']);
              });
            } else {
              await this.loadUsers();
            }
          } catch (error) {
            console.error("Error obteniendo permisos:", error);
          }
        });
      }
    });
  }

  async loadUsers() {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const querySnapshot = await getDocs(usersCollection);

      this.ngZone.run(() => {
        this.users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Usuarios obtenidos:", this.users);
      });
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  }

  async addUser() {
    try {
        if (!this.newUser.password) {
            alert("La contraseña no puede estar vacía.");
            return;
        }

        const hashedPassword = await bcrypt.hash(this.newUser.password, 10);

        const usersCollection = collection(this.firestore, 'users');
        await addDoc(usersCollection, {
            email: this.newUser.email,
            username: this.newUser.username,
            password: hashedPassword,  
            role: this.newUser.role
        });

        alert("Usuario agregado correctamente.");
        await this.loadUsers();

        this.newUser = { email: '', username: '', password: '', role: 'user' };
    } catch (error) {
        console.error("Error al agregar usuario:", error);
        alert("Error al registrar usuario.");
    }
}


  loadUserData() {
    if (this.selectedUser) {
      console.log("Usuario seleccionado:", this.selectedUser);
    }
  }

  async updateUser() {
    if (!this.selectedUser) return;
    try {
      const userRef = doc(this.firestore, 'users', this.selectedUser.id);
      await updateDoc(userRef, { role: this.selectedUser.role });
      alert("Usuario actualizado correctamente.");
      await this.loadUsers();
      this.selectedUser = null;
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  }
}

import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        onAuthStateChanged(auth, (user) => {
            console.log('Auth state changed:', user ? user.email : 'No user');
            if (user) {
                this.currentUser = user;
                // Não recarrega, apenas esconde o loading
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                }
            } else {
                this.currentUser = null;
                this.showLoginScreen();
            }
        });
    }

    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async register(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    showLoginScreen() {
        // Criar tela de login/registro
        const loginHTML = `
            <div class="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
                <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                    <div class="text-center mb-8">
                        <i class="fas fa-chart-line text-6xl text-indigo-600 mb-4"></i>
                        <h1 class="text-3xl font-bold text-gray-800">FinanControl</h1>
                        <p class="text-gray-600 mt-2">Seu controle financeiro pessoal</p>
                    </div>

                    <div class="mb-6">
                        <div class="flex border-b border-gray-300">
                            <button id="tabLogin" class="flex-1 py-3 text-center font-medium border-b-2 border-indigo-600 text-indigo-600">
                                Login
                            </button>
                            <button id="tabRegister" class="flex-1 py-3 text-center font-medium text-gray-500">
                                Registrar
                            </button>
                        </div>
                    </div>

                    <form id="formLogin" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                            <input type="email" id="loginEmail" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                            <input type="password" id="loginPassword" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        </div>
                        <button type="submit" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition">
                            Entrar
                        </button>
                    </form>

                    <form id="formRegister" class="space-y-4 hidden">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                            <input type="email" id="registerEmail" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                            <input type="password" id="registerPassword" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                            <input type="password" id="registerPasswordConfirm" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        </div>
                        <button type="submit" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition">
                            Criar Conta
                        </button>
                    </form>

                    <div id="authMessage" class="mt-4 text-center text-sm"></div>
                </div>
            </div>
        `;

        document.body.innerHTML = loginHTML;

        // Event listeners
        document.getElementById('tabLogin').addEventListener('click', () => {
            document.getElementById('tabLogin').classList.add('border-indigo-600', 'text-indigo-600');
            document.getElementById('tabLogin').classList.remove('text-gray-500');
            document.getElementById('tabRegister').classList.remove('border-indigo-600', 'text-indigo-600');
            document.getElementById('tabRegister').classList.add('text-gray-500');
            document.getElementById('formLogin').classList.remove('hidden');
            document.getElementById('formRegister').classList.add('hidden');
        });

        document.getElementById('tabRegister').addEventListener('click', () => {
            document.getElementById('tabRegister').classList.add('border-indigo-600', 'text-indigo-600');
            document.getElementById('tabRegister').classList.remove('text-gray-500');
            document.getElementById('tabLogin').classList.remove('border-indigo-600', 'text-indigo-600');
            document.getElementById('tabLogin').classList.add('text-gray-500');
            document.getElementById('formRegister').classList.remove('hidden');
            document.getElementById('formLogin').classList.add('hidden');
        });

        document.getElementById('formLogin').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const result = await this.login(email, password);
            const messageEl = document.getElementById('authMessage');
            
            if (result.success) {
                messageEl.className = 'mt-4 text-center text-sm text-green-600';
                messageEl.textContent = 'Login realizado com sucesso!';
            } else {
                messageEl.className = 'mt-4 text-center text-sm text-red-600';
                messageEl.textContent = 'Erro ao fazer login. Verifique suas credenciais.';
            }
        });

        document.getElementById('formRegister').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerPasswordConfirm').value;
            
            const messageEl = document.getElementById('authMessage');
            
            if (password !== confirmPassword) {
                messageEl.className = 'mt-4 text-center text-sm text-red-600';
                messageEl.textContent = 'As senhas não coincidem!';
                return;
            }
            
            const result = await this.register(email, password);
            
            if (result.success) {
                messageEl.className = 'mt-4 text-center text-sm text-green-600';
                messageEl.textContent = 'Conta criada com sucesso!';
            } else {
                messageEl.className = 'mt-4 text-center text-sm text-red-600';
                messageEl.textContent = 'Erro ao criar conta. Tente novamente.';
            }
        });
    }

    onUserLoggedIn(user) {
        // Não fazer nada aqui, o app.js cuida do resto
        console.log('User logged in:', user.email);
    }
}

export default AuthManager;

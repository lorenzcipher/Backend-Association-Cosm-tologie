#!/usr/bin/env node

const https = require('https');
const http = require('http');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
let TOKEN = '';

// Fonction utilitaire pour faire des requêtes HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Test de l\'API Association Cosmétologie');
  console.log('Base URL:', BASE_URL);
  console.log('');

  try {
    // Test 1: Articles publics (sans auth)
    console.log('📚 Test 1: Articles publics...');
    const articlesResponse = await makeRequest(`${BASE_URL}/articles`);
    console.log(`Status: ${articlesResponse.status}`);
    console.log('Response:', JSON.stringify(articlesResponse.data, null, 2));
    console.log('');

    // Test 2: Inscription
    console.log('📝 Test 2: Inscription...');
    const registerData = {
      email: `test-${Date.now()}@example.com`,
      password: 'test123456',
      firstName: 'Test',
      lastName: 'User',
      professionalStatus: 'student',
      domainOfInterest: ['skincare']
    };

    const registerResponse = await makeRequest(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: registerData
    });
    console.log(`Status: ${registerResponse.status}`);
    console.log('Response:', JSON.stringify(registerResponse.data, null, 2));
    console.log('');

    // Test 3: Connexion
    console.log('🔐 Test 3: Connexion...');
    const loginResponse = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: registerData.email,
        password: registerData.password
      }
    });
    console.log(`Status: ${loginResponse.status}`);
    
    if (loginResponse.data.data && loginResponse.data.data.token) {
      TOKEN = loginResponse.data.data.token;
      console.log('Token récupéré:', TOKEN.substring(0, 20) + '...');
    }
    console.log('');

    // Test 4: Profil (avec auth)
    if (TOKEN) {
      console.log('👤 Test 4: Profil utilisateur...');
      const profileResponse = await makeRequest(`${BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      });
      console.log(`Status: ${profileResponse.status}`);
      console.log('Response:', JSON.stringify(profileResponse.data, null, 2));
      console.log('');
    }

    // Test 5: Contact
    console.log('📞 Test 5: Formulaire de contact...');
    const contactResponse = await makeRequest(`${BASE_URL}/contact`, {
      method: 'POST',
      body: {
        name: 'Test Contact',
        email: 'contact@test.com',
        subject: 'Test automatisé',
        message: 'Message de test automatisé'
      }
    });
    console.log(`Status: ${contactResponse.status}`);
    console.log('Response:', JSON.stringify(contactResponse.data, null, 2));
    console.log('');

    // Test 6: Événements
    console.log('🎉 Test 6: Événements...');
    const eventsResponse = await makeRequest(`${BASE_URL}/events`);
    console.log(`Status: ${eventsResponse.status}`);
    console.log('Response:', JSON.stringify(eventsResponse.data, null, 2));
    console.log('');

    console.log('✅ Tous les tests terminés!');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    process.exit(1);
  }
}

// Lancer les tests
runTests();
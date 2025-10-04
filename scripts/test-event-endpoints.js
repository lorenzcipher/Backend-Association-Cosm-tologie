const BASE_URL = 'http://localhost:3000/api';

// Fonction pour tester les endpoints d'événements
async function testEventEndpoints() {
  console.log('🧪 Test des endpoints d\'événements...\n');

  try {
    // Test 1: Créer un événement (nécessite un token admin)
    console.log('1. Test de création d\'événement...');
    const createEventData = {
      title: 'Test Event',
      description: 'Description de l\'événement test',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2h
      location: 'Paris, France',
      isOnline: false,
      isMemberOnly: false,
      maxParticipants: 50,
      registrationRequired: true,
      registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Dans 5 jours
      memberPrice: 25,
      nonMemberPrice: 35
    };

    const createResponse = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' // À remplacer par un vrai token
      },
      body: JSON.stringify(createEventData)
    });

    if (createResponse.ok) {
      const createdEvent = await createResponse.json();
      console.log('✅ Événement créé:', createdEvent.data.title);
      
      const eventId = createdEvent.data._id;
      
      // Test 2: Récupérer l'événement
      console.log('\n2. Test de récupération d\'événement...');
      const getResponse = await fetch(`${BASE_URL}/events/${eventId}`);
      
      if (getResponse.ok) {
        const event = await getResponse.json();
        console.log('✅ Événement récupéré:', event.data.title);
      } else {
        console.log('❌ Erreur lors de la récupération:', await getResponse.text());
      }

      // Test 3: Mettre à jour l'événement
      console.log('\n3. Test de mise à jour d\'événement...');
      const updateData = {
        title: 'Test Event Updated',
        description: 'Description mise à jour',
        maxParticipants: 75
      };

      const updateResponse = await fetch(`${BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' // À remplacer par un vrai token
        },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        const updatedEvent = await updateResponse.json();
        console.log('✅ Événement mis à jour:', updatedEvent.data.title);
      } else {
        console.log('❌ Erreur lors de la mise à jour:', await updateResponse.text());
      }

      // Test 4: Inscription à l'événement
      console.log('\n4. Test d\'inscription à l\'événement...');
      const registerResponse = await fetch(`${BASE_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer YOUR_USER_TOKEN' // À remplacer par un vrai token utilisateur
        }
      });

      if (registerResponse.ok) {
        const registration = await registerResponse.json();
        console.log('✅ Inscription réussie');
      } else {
        console.log('❌ Erreur lors de l\'inscription:', await registerResponse.text());
      }

      // Test 5: Désinscription de l'événement
      console.log('\n5. Test de désinscription de l\'événement...');
      const unregisterResponse = await fetch(`${BASE_URL}/events/${eventId}/register`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer YOUR_USER_TOKEN' // À remplacer par un vrai token utilisateur
        }
      });

      if (unregisterResponse.ok) {
        console.log('✅ Désinscription réussie');
      } else {
        console.log('❌ Erreur lors de la désinscription:', await unregisterResponse.text());
      }

      // Test 6: Supprimer l'événement
      console.log('\n6. Test de suppression d\'événement...');
      const deleteResponse = await fetch(`${BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          // 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' // À remplacer par un vrai token
        }
      });

      if (deleteResponse.ok) {
        console.log('✅ Événement supprimé');
      } else {
        console.log('❌ Erreur lors de la suppression:', await deleteResponse.text());
      }

    } else {
      console.log('❌ Erreur lors de la création:', await createResponse.text());
    }

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Fonction pour tester la récupération de tous les événements
async function testGetAllEvents() {
  console.log('\n7. Test de récupération de tous les événements...');
  
  try {
    const response = await fetch(`${BASE_URL}/events`);
    
    if (response.ok) {
      const events = await response.json();
      console.log('✅ Événements récupérés:', events.data.events.length, 'événements trouvés');
    } else {
      console.log('❌ Erreur lors de la récupération:', await response.text());
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter les tests
async function runTests() {
  console.log('🚀 Démarrage des tests des endpoints d\'événements\n');
  console.log('⚠️  Note: Les tests nécessitent des tokens d\'authentification valides');
  console.log('⚠️  Remplacez les commentaires Authorization par de vrais tokens\n');
  
  await testEventEndpoints();
  await testGetAllEvents();
  
  console.log('\n✨ Tests terminés!');
}

// Exporter pour utilisation dans d'autres scripts
module.exports = {
  testEventEndpoints,
  testGetAllEvents,
  runTests
};

// Exécuter si le script est appelé directement
if (require.main === module) {
  runTests();
}

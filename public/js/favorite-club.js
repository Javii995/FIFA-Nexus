document.addEventListener('DOMContentLoaded', async () => {
    try {
    
      const response = await fetch('/api/clubs');
      const result = await response.json();
      
      if (result && result.items) {
   
        const clubsContainer = document.getElementById('favoriteClubsGrid');
        
       
        const existingCards = clubsContainer.querySelectorAll('.club-card');
        if (existingCards.length > 0) {
          existingCards.forEach(card => {
            if (!card.dataset.fromApi) {
              card.style.display = 'none';
            }
          });
        }
        
      
        result.items.forEach(club => {
          const clubElement = createClubElement(club);
          clubsContainer.appendChild(clubElement);
        });
      } else {
        console.error('Geen clubs gevonden in de API-response');
      }
    } catch (error) {
      console.error('Fout bij het ophalen van clubs:', error);
    }
  });
  
 
  function createClubElement(club) {
    const clubDiv = document.createElement('div');
    clubDiv.className = 'card club-card';
    clubDiv.dataset.clubId = club.id;
    clubDiv.dataset.fromApi = 'true';
    

    clubDiv.innerHTML = `
      <div class="image" style="background-color: #2c3e50;">
        <div class="overlay">
          <h3>${club.name}</h3>
          <p>${club.league ? `League ID: ${club.league}` : 'Geen league'}</p>
        </div>
      </div>
      <div class="club-details">
        <h3>${club.name}</h3>
        <p>Druk voor meer informatie</p>
        <div class="stats">
          <span><i class="fas fa-eye"></i> Gezien: <span class="seen-count">0</span> keer</span>
        </div>
        <div class="actions">
          <button class="gradient-button seen-btn"><i class="fas fa-plus"></i></button>
          <button class="gradient-button remove-btn"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
    
    return clubDiv;
  }
  
 
  document.addEventListener('DOMContentLoaded', () => {
    const clubsGrid = document.getElementById('favoriteClubsGrid');
    const modal = document.getElementById('clubDetailsModal');
    const closeModal = document.querySelector('.close-modal');
    

    clubsGrid.addEventListener('click', (e) => {
      const clubCard = e.target.closest('.club-card');
      if (clubCard && !e.target.closest('.actions')) {
        const clubId = clubCard.dataset.clubId;
        showClubDetails(clubId);
      }
    });
    
   
    clubsGrid.addEventListener('click', (e) => {
  
      if (e.target.closest('.seen-btn')) {
        const clubCard = e.target.closest('.club-card');
        const seenCount = clubCard.querySelector('.seen-count');
        const newCount = parseInt(seenCount.textContent) + 1;
        seenCount.textContent = newCount;
    
      }
      
      
      if (e.target.closest('.remove-btn')) {
        const clubCard = e.target.closest('.club-card');
       
        clubCard.remove();
      }
    });
    
    
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
    
    
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
  });
  
 
  function showClubDetails(clubId) {
   
    console.log(`Details opvragen voor club met ID: ${clubId}`);
    
   
    const modal = document.getElementById('clubDetailsModal');
    modal.style.display = 'flex';
    
   
    document.getElementById('modalClubName').textContent = `Club ${clubId}`;
  }
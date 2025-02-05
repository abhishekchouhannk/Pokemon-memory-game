async function setupGrid(numberOfCards) {
  return new Promise((resolve, reject) => {
    constructCardData(numberOfCards)
      .then((cardData) => {
        var gameGrid = $("#game_grid");

        for (var i = 0; i < cardData.length; i++) {
          var card = $("<div>").addClass("card");
          var frontFace = $("<img>")
            .attr("id", cardData[i].id)
            .addClass("front_face")
            .attr("src", cardData[i].frontFace)
            .attr("alt", "");
          var backFace = $("<img>")
            .addClass("back_face")
            .attr("src", "back.webp")
            .attr("alt", "");

          card.append(frontFace);
          card.append(backFace);
          gameGrid.append(card);
        }

        // Resolve the promise to indicate setupGrid is complete
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

const fetchPokemonInfo = async (numberOfPokemon) => {
  const pokemonArray = [];
  const startTime = new Date();

  const getRandomNumber = () => Math.floor(Math.random() * 1000) + 1;

  // Create an array of promises for fetching each Pokemon
  const fetchPromises = Array.from({ length: numberOfPokemon }, () =>
    fetch(`https://pokeapi.co/api/v2/pokemon/${getRandomNumber()}`)
      .then((response) => response.json())
      .then((data) =>
        pokemonArray.push(data.sprites.other["official-artwork"].front_default)
      )
  );

  // Wait for all promises to resolve
  await Promise.all(fetchPromises);

  const endTime = new Date();
  const totalTime = endTime - startTime;

  console.log(
    `Fetched ${numberOfPokemon} Pokémon in ${totalTime} milliseconds.`
  );

  return pokemonArray;
};

// Function to construct an array of card data with Pokémon URLs
const constructCardData = async (numberOfCards) => {
  const pokemonUrls = await fetchPokemonInfo(numberOfCards / 2);

  const cardData = [];
  for (let i = 0; i < numberOfCards; i += 2) {
    const id = `img${i + 1}`;
    const frontFace = pokemonUrls[i / 2];

    cardData.push({ id, frontFace }, { id: `img${i + 2}`, frontFace });
  }

  // Randomize the cardData array using Fisher-Yates shuffle algorithm
  for (let i = cardData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardData[i], cardData[j]] = [cardData[j], cardData[i]];
  }

  return cardData;
};

async function setDifficulty(difficulty) {
  /*
  difficulty chart:
  easy : 16 cards (4 * 4)
  medium : 30 cards (6 * 5)
  hard : 54 cards (9 * 6) 
  */
  if (difficulty == 16) {
    await setupGrid(difficulty);
    // Update grid styles
    $('#game_grid').css({
      width: '600px',
      height: '600px'
    });

    // Update card styles
    $('.card').css({
    width: '25%',
    height: '150px'
    });
      // Update img styles
    $('img').css({
      height: '150px'
    });
  } else if (difficulty == 30) {
    await setupGrid(difficulty);
    // Update grid styles
    $('#game_grid').css({
      width: '720px',
      height: '600px'
    });

    // Update card styles
    $('.card').css({
    width: '16.66%',
    height: '120px'
    });
      // Update img styles
    $('img').css({
      height: '120px'
    });
  } else if (difficulty == 54) {
    await setupGrid(difficulty);
    // Update grid styles
    $('#game_grid').css({
      width: '900px',
      height: '600px'
    });

    // Update card styles
    $('.card').css({
    width: '11.11%',
    height: '100px'
    });
      // Update img styles
    $('img').css({
      height: '100px'
    });
  }
}

var difficultyChosen = 0;

const setup = async (difficulty) => {

  await setDifficulty(difficulty);

  var clicks = 0;
  let firstCard = undefined;
  let secondCard = undefined;
  let failedAttempts = 0;
  let isClickable = true; // Flag to prevent clicking during animations
  let totalPairs = 0;
  if (difficulty == 16) {
    totalPairs = 8;
  } else if (difficulty == 30) {
    totalPairs = 15;
  } else if (difficulty == 54) {
    totalPairs = 27;
  }
  $('#totalPairs').text(`Total Pairs: ${totalPairs}`);
  $('#pairsLeft').text(`Pairs Left: ${totalPairs}`);
   

  let flippedCards = [];

  $(".card").on("click", function () {
    if (!isClickable || $('#game_grid').attr('data-disabled') === 'true') return; // Prevent clicking during animations

    if (firstCard && $(this).find(".front_face")[0].id == firstCard.id) return; // Prevent clicking the same card

    clicks++;
    $('#clicks').text(`Clicks: ${clicks}`);
    console.log("clicks: " + clicks);
  
    $(this).toggleClass("flip");
  
    if (!firstCard) {
      firstCard = $(this).find(".front_face")[0];
    } else if (!secondCard) {
      isClickable = false; // Disable clicking during comparison
      secondCard = $(this).find(".front_face")[0];
      // console.log(firstCard, secondCard);
  
      if (firstCard.src === secondCard.src && firstCard.id != secondCard.id) {
        // console.log("match");
        $(`#${firstCard.id}`).parent().off("click");
        $(`#${secondCard.id}`).parent().off("click");
  
        flippedCards.push(firstCard.id, secondCard.id);
        $('#pairsLeft').text(`Pairs Left: ${totalPairs - (flippedCards.length / 2)}`);
        $('#pairsMatched').text(`Pairs Matched: ${flippedCards.length / 2}`);
        if((flippedCards.length / 2) == totalPairs) {
          // const time = $('#timer').text();
          setTimeout(function() {
            $('#winClicks').text(clicks);
            const timerValue = $('#timer').text();
            const number = parseInt(timerValue.replace('Timer: ', ''));
            $('#winTime').text(number);
            $('#winModal').modal('show');
          }, 2000); // Delay of 2000 milliseconds (2 seconds)    
        }
        // console.log(flippedCards)
  
        firstCard = undefined;
        secondCard = undefined;
        isClickable = true; // Re-enable clicking
        failedAttempts = 0;
      } else {
        // console.log("no match");
        setTimeout(() => {
          if (!flippedCards.includes(firstCard.id)) {
            $(`#${firstCard.id}`).parent().toggleClass("flip");
          }
          if (!flippedCards.includes(secondCard.id)) {
            $(`#${secondCard.id}`).parent().toggleClass("flip");
          }
  
          firstCard = undefined;
          secondCard = undefined;
          isClickable = true; // Re-enable clicking
  
          failedAttempts++;
          if (failedAttempts >= 4) {
            isClickable = false;
            // Flip all non-matched cards for a peek
            setTimeout(() => {
              $(".card").each(function () {
                const frontFace = $(this).find(".front_face")[0];
                if (!flippedCards.includes(frontFace.id)) {
                  $(this).addClass("flip");
                }
              });
              setTimeout(() => {
                $(".card").each(function () {
                  const frontFace = $(this).find(".front_face")[0];
                  if (!flippedCards.includes(frontFace.id)) {
                    $(this).removeClass("flip");
                  }
                });
                isClickable = true;
              }, 2000); // Set the duration of the peek to 2 seconds
            }, 1000);
            failedAttempts = 0; // Reset failed attempts count
          }
        }, 1000);
      }
    }
  });


};

// $(document).ready(setup);

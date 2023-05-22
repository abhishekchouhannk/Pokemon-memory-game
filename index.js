async function setupGrid(numberOfCards) {
  return new Promise((resolve, reject) => {
    constructCardData(numberOfCards)
      .then((cardData) => {
        console.log(cardData);
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
        console.log("actual finished");

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

  return cardData;
};

const setup = async () => {
  await setupGrid(40);

  let firstCard = undefined;
  let secondCard = undefined;
  let isClickable = true; // Flag to prevent clicking during animations

  $(".card").on("click", function () {
    if (!isClickable) return; // Prevent clicking during animations

    $(this).toggleClass("flip");

    if (!firstCard) {
      firstCard = $(this).find(".front_face")[0];
    } else if (!secondCard) {
      isClickable = false; // Disable clicking during comparison
      secondCard = $(this).find(".front_face")[0];
      console.log(firstCard, secondCard);

      if (firstCard.src === secondCard.src && firstCard.id != secondCard.id) {
        console.log("match");
        $(`#${firstCard.id}`).parent().off("click");
        $(`#${secondCard.id}`).parent().off("click");

        firstCard = undefined;
        secondCard = undefined;
        isClickable = true; // Re-enable clicking
      } else {
        console.log("no match");
        setTimeout(() => {
          $(`#${firstCard.id}`).parent().toggleClass("flip");
          $(`#${secondCard.id}`).parent().toggleClass("flip");

          firstCard = undefined;
          secondCard = undefined;
          isClickable = true; // Re-enable clicking
        }, 1000);
      }
    }
  });
};



$(document).ready(setup);


//Global variables are set by the user to indicate their diet and allergy information
let allergies = [];
let dietFilter = '';

let dayIndex = -1;
let offset = Math.floor(Math.random() * 500);

function getRecipesForWeek() { 
  $.ajax({
    url: `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/searchComplex?diet=${dietFilter}&addRecipeInformation=false&number=7&offset=${offset}&instructionsRequired=true&intolerances=${allergies}&limitLicense=false&maxCalories=600&type=main+course`,
      type: 'GET',
      dataType: 'json',
      success: function (result) { console.log(result); displayRecipesForWeek(result) },
      error: function() { alert('boo!'); },
      beforeSend: setHeader
      });
  };


function getRecipeForDay(day, query, offset) { 
  $.ajax({
    url: `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/searchComplex?query=${query}&diet=${dietFilter}&addRecipeInformation=false&number=1&offset=${offset}&instructionsRequired=true&intolerances=${allergies}&limitLicense=false&maxCalories=600&type=main+course`,
      type: 'GET',
      dataType: 'json',
      success: function (result) { displayRecipeForDay(result, day) },
      error: function() {  },
      beforeSend: setHeader
      });
  };



function setHeader(xhr) {
        xhr.setRequestHeader('X-Mashape-Key', 'DwXMjCgQGQmshC8MyFU6bVgOQS1Lp1tlRvZjsn3JvI9Q2hZZBC');
      }


function getRecipeInfo(id, day) { 
  $.ajax({
    url: `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/${id}/information`,
      type: 'GET',
      dataType: 'json',
      success: function (result) { console.log(result); renderRecipeInfo(result, day) },
      error: function() { alert('boo!'); },
      beforeSend: setHeader
      });
}




function displayRecipeForDay(data, day) {
  let dayCard = `${day}`
  const results = data.results.map((item, day, index) => renderDayCard(item, dayCard));
  $(`#${day}Card`).html(results);
  console.log(`display recipe function day: ${day}`)
}


function formatMeasurements (amount, unit) {
  if (amount % 1 === 0) {
  //if the amount is a whole number, return the amount normally
      return amount
  } else if (unit === "oz" || unit === "Ounces" || unit === "ounces" ) {
  //display ounces as decimals rounded to the nearest hundreth
    return Math.round(amount, 2)
  } else {
  //return other measurements (cups, pounds, teaspoons, etc.) as fractions
    let fraction = math.fraction(amount)
    //improper fractions are converted into mixed numbers
    let denominator = fraction.d
    let numerator = fraction.n
    let remainder = numerator % denominator // 2.25  => 9/4   
    let wholeNumber = parseInt(numerator/denominator) // => 2
    if (wholeNumber === 0) {
    //if there isn't a whole number, then just return the fraction
      return `${remainder}/${denominator} `
    } else {
    //otherwise, return the mixed number
      return `${wholeNumber} ${remainder}/${denominator} ` // => 2 1/4
    }
  }
}


function renderModalContent(result, day) {
  return `
      <span class="close">&times;</span>
        <h3 id="recipe-title${day}">${result.title}</h3>
          <img id="card-image${day}" class="modal-card-image" src="${result.image}" alt="${result.title} image">
          <span class="credit"></span>
          <div id="recipe-ingredients${day}" class="ingredient-container">
            <ul class="recipe-ingredients">
            </ul>
          </div>  
          <div id="recipe-instructions${day}" class="instructions-container">
          <ol class="recipe-instructions">
          </ol>
        </div> 
      `  
}

function renderRecipeInfo(result, day)  {
  //credit the source of the recipe
  modalContent = renderModalContent(result,day)
  $('.modal-content').html(modalContent)
  let sourceName = result.sourceName
  if (sourceName == null) {
    sourceName = 'Visit Source'
  }

  $('.credit').append(`<a title="Go to Source" href="${result.sourceUrl}" target="_blank">Credit: ${sourceName}</a>`)
  for (let i = 0; i < result.extendedIngredients.length; i++) {
  //for each ingredient in array, render a list item with the amount, unit and the ingredient
    let amount = result.extendedIngredients[i].amount
    let unit = result.extendedIngredients[i].unit
    let ingredient = result.extendedIngredients[i].name
    $(`.recipe-ingredients`).append(`<li>${formatMeasurements(amount, unit)} ${unit} - ${ingredient}</li>`)
  }
  for (let x = 0; x < result.analyzedInstructions.length; x++) {
  //for each array of steps in the analyzed instruction array, render a list item for each step
    for (let y = 0; y < result.analyzedInstructions[x].steps.length; y++) {
    $(`.recipe-instructions`).append(`<li>${result.analyzedInstructions[x].steps[y].step}</li>`)
    }
  }
}



function renderMenu(offset, result) {
  dayIndex++
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  let html = `
  <div class="col-4"> 
    <span id="day-title${days[dayIndex]}" class = "day-title">${days[dayIndex]}</span>
    <div id="${days[dayIndex]}Card" class="recipe-card">
      <h3 id="recipe-title${days[dayIndex]}" class="recipe-title">${result.title}</h3>
      <button id="js-view-recipe-btn" class="js-view-recipe-btn controls-button" data-recipe-id="${result.id}" data-day="${days[dayIndex]}">
        <img id="card-image${days[dayIndex]}" class="card-image" src="${result.image}" alt="${result.title} image">
        <br><div class="view-recipe-div">View Recipe</div>
      </button>
    </div>
    <form class="ingredient-form">
      <input id="search-by-ingredient${days[dayIndex]}" class="search-by-ingredient" type="search" name="search-by-ingredient" placeholer="Search By Ingredient">
      <button title="Search For Recipes By Ingredient" id="search-by-ingredient-btn" class="search-by-ingredient-btn controls-button" data-day="${days[dayIndex]}">Search</button>
    </form>
    <div class="recipe-controls">
      <button title="View Previous Recipe Option" id="js-previous-result-btn${days[dayIndex]}" class="js-previous-result-btn controls-button previous" data-day="${days[dayIndex]}" aria-live="assertive">
      <i class="fas fa-chevron-circle-left"></i></button>
      <button title="Remove Recipe For ${days[dayIndex]}" id="js-remove-day${days[dayIndex]}" class="js-remove-day controls-button remove" data-day="${days[dayIndex]}">
      <i class="far fa-times-circle"></i></button>
      <button title="View Next Recipe Option" id="js-next-result-btn${days[dayIndex]}" class="js-next-result-btn controls-button next" data-day="${days[dayIndex]}">
      <i class="fas fa-chevron-circle-right"></i></button>
      <span id="ingredient-query${days[dayIndex]}" class="ingredient-query"></span>
    </div>
    <!-- The Modal -->
    <section role="region" id="recipeModal${days[dayIndex]}" class="modal" aria-live="assertive" hidden>
    <!-- Modal content -->
      <div class="modal-content">  
      </div>
    </section>
  </div>

`

console.log(`the id for ${days[dayIndex]} is ${result.id}`)

return html
}


function renderDayCard(result, day) {  
  let html = `
      <h3 class="recipe-title">${result.title}</h3>
      <button id="js-view-recipe-btn" class="js-view-recipe-btn controls-button" data-recipe-id="${result.id}" data-day="${day}">
        <img id="card-image${day}" class="card-image" src="${result.image}" alt="${result.title}">
        <div class="view-recipe-div">View Recipe</div>
      </button>
`
 offset += 7

return html


}

function renderNotCooking(day) {  
  return `
        <h3 id="recipe-title${day}" class="recipe-title">Not Cooking</h3>
      <img id="card-image${day}" class="card-image" src="https://www.displayfakefoods.com/store/pc/catalog/2189-lg.jpg" alt="Not cooking image">

`}



function displayRecipesForWeek(data, offset) {
  const results = data.results.map((item, offset, index) => renderMenu(offset, item));
  $('.js-search-results').html(results);
}



function watchBeginClick() {
  $('.js-begin-btn').click(event => {
    event.preventDefault();
    $('.js-select-diet').prop('hidden', false);
    $('.js-intro').prop('hidden', true);
    });
}



function watchViewRecipeClick() {
  openRecipeModal();

}

function openRecipeModal() {
  $('.js-output').on('click', '.js-view-recipe-btn', function(event) {
    event.preventDefault();
    let day = $(this).data('day')
    $(`#recipeModal${day}`).prop('hidden', false);
    let recipeId = $(this).data('recipe-id');
    getRecipeInfo(recipeId, day);
      closeRecipeModal(day);
    
  });
}

function closeRecipeModal(day) {
  $('.js-output').on('click', '.close', function(event) {
    event.preventDefault();
    console.log(`Click! ${day}`)
    $(`#recipeModal${day}`).prop('hidden', true);

  });



$(document).click(function(event) {
  if (!$(event.target).closest('.modal-content, .js-view-recipe-btn' ).length) {
    $("body").find(".modal").prop('hidden', true);
  }
});
}



function watchMenuSubmit() {
  $('.js-select-diet').submit(event => {
    event.preventDefault();
    $('.js-output').prop('hidden', false);
    $('.js-menu-controls').prop('hidden', false);
    $('.js-select-diet').prop('hidden', true);
    $('input:checkbox[name=intolerance]:checked').map(function() 
      {
        allergies.push($(this).val())
      });
    dietFilter = $('#diet-filter').val();
    getRecipesForWeek();
  });
}

function watchSearchByIngredientClick() {
  $('.js-output').on('click', '.search-by-ingredient-btn', function(event) {
  event.preventDefault();
  let day = $(this).data('day');
  let ingredient = $(`#search-by-ingredient${day}`).val();
  $(`#ingredient-query${day}`).text(`Result for ${ingredient}`)
  offset = Math.floor(Math.random() * 200)
  getRecipeForDay(day, ingredient, offset);
  console.log(`${day} ${ingredient} option pressed`)
  })
}

function watchNextResultClick() {
  $('.js-output').on('click', '.js-next-result-btn', function(event) {
  event.preventDefault();
  let day = $(this).data('day');
  let ingredient = $(`#search-by-ingredient${day}`).val();
  getRecipeForDay(day, ingredient, offset);
  console.log(`${day} ${ingredient} option pressed`)
  })
}

function watchPreviousResultClick() {
  $('.js-output').on('click', '.js-previous-result-btn', function(event) {
  event.preventDefault();
  let day = $(this).data('day');
  let ingredient = $(`#search-by-ingredient${day}`).val();
  offset -= 14;
  getRecipeForDay(day, ingredient, offset);
  console.log(`${day} ${ingredient} option pressed`)
  })
}

function watchRemoveClick() {
   $('.js-output').on('click', '.js-remove-day', function(event) {
  event.preventDefault();
  let day = $(this).data('day');
  let ingredient = ''
  $(`#${day}Card`).html(renderNotCooking(day));
  console.log(`${day} ${ingredient} option pressed`)
  })
}

function watchStartOver() {
  $('.js-menu-controls').on('click', '.js-start-over', function(event) {
    event.preventDefault();
    console.log("refresh clicked")
    location.reload();
  })
}

function watchRefreshMenuClick() {
  $('.js-menu-controls').on('click', '.js-refresh-menu', function(event) {
    dayIndex -= 7
    getRecipesForWeek();
})
}

function watchEmailSubmit() {
  $('.email').submit(function(event) {
  event.preventDefault();
  let emailAddress = $('.emailaddress').val();
  let subject = "CrunchTime: My Menu"
  let mondayRecipeLink = ""
  let body = `Monday: ${mondayRecipeLink}`
  window.open(`mailto:${emailAddress}?subject=${subject}&body=${body}`);
});
}


function handleMenuGenerator() {
  watchBeginClick();
  watchMenuSubmit();
  watchViewRecipeClick()
  watchSearchByIngredientClick();
  watchNextResultClick();
  watchPreviousResultClick();
  watchRemoveClick();
  watchRefreshMenuClick();
  watchStartOver();
  watchEmailSubmit();
}

$(handleMenuGenerator)
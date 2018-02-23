
//Global variables are set by the user to indicate their diet and allergy information
let allergies = [];
let dietFilter = '';


let dayIndex = -1;
let initialOffset = 0;
let offset = 1;

function getRecipesForWeek(allergies, diet) { 
  initialOffset = Math.floor(Math.random() * 200)
  $.ajax({
    url: `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/searchComplex?diet=${diet}&addRecipeInformation=false&number=7&offset=${initialOffset}&instructionsRequired=true&intolerances=${allergies}&limitLicense=false&maxCalories=600&type=main+course`,
      type: 'GET',
      dataType: 'json',
      success: function (result) { console.log(result); displayRecipesForWeek(result) },
      error: function() { alert('boo!'); },
      beforeSend: setHeader
      });
  };


function getRecipeForDay(allergies, diet, day, query, offset) { 
  $.ajax({
    url: `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/searchComplex?query=${query}&diet=${diet}&addRecipeInformation=false&number=1&offset=${offset}&instructionsRequired=true&intolerances=${allergies}&limitLicense=false&maxCalories=600&type=main+course`,
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


function getRecipeInfo(id) { 
  $.ajax({
    url: `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/${id}/information`,
      type: 'GET',
      dataType: 'json',
      success: function (result) { console.log(result); renderRecipeInfo(result) },
      error: function() { alert('boo!'); },
      beforeSend: setHeader
      });
}




function displayRecipeForDay(data, day) {
  const results = data.results.map((item, day, index) => renderDayCard(item, day));
  $(`#${day}Card`).html(results);
}



function formatMeasurements (amount, unit) {
  if (amount % 1 === 0) {
  //if the amount is a whole number, return the amount normally
      return amount
  } else if (unit === "oz" || unit === "Ounces" || unit === "ounces" ) {
  //ounces, however, are displayed as decimals rounded to the nearest hundreth
    return Math.round(amount, 2)
  } else {
  //other measurments (cups, pounds, teaspoons, etc.) are turned into fractions
    let fraction = math.fraction(amount)
    //improper fractions are converted into mixed numbers
    let denominator = fraction.d
    let numerator = fraction.n
    let remainder = numerator % denominator // 2.25  => 9/8   
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




function renderRecipeInfo(result)  {
  //credit the source of the recipe
  $('.credit').append(`<a title="Go to Source" href="${result.sourceUrl}">${result.sourceName}</a>`)
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
  
  return `
  <div class="col-4"> 
    <span id="day-title${days[dayIndex]}" class = "day-title">${days[dayIndex]}</span>
    <div id="${days[dayIndex]}Card" class="recipe-card">
        <h3 id="recipe-title${days[dayIndex]}" class="recipe-title">${result.title}</h3>
        <p id="calories${days[dayIndex]}">Calories: ${result.calories}</p>
        <p id="protein${days[dayIndex]}">Protein: ${result.protein}</p>
        <img id="card-image${days[dayIndex]}" class="card-image" src="${result.image}" alt="${result.title} image">
        <button id="js-view-recipe-btn" class="js-view-recipe-btn" value="${result.id}">View Recipe</button>
    </div>
         <form><input id="search-by-ingredient${days[dayIndex]}" class="search-by-ingredient" type="search" name="search-by-ingredient" placeholer="Search By Ingredient">
         <button title="Search For A Recipe By Ingredient" id="search-by-ingredient-btn" class="search-by-ingredient-btn" value="${days[dayIndex]}">Search</button></form>
         <button title="View Previous Recipe Option" id="js-previous-result-btn${days[dayIndex]}" class="js-previous-result-btn" value="${days[dayIndex]}" aria-live="assertive"><i class="fas fa-chevron-circle-left"></i></button>
         <button title="Remove Recipe For ${days[dayIndex]}" id="js-remove-day${days[dayIndex]}" class="js-remove-day" value="${days[dayIndex]}"><i class="far fa-times-circle"></i></button>
         <button title="View Next Recipe Option" id="js-next-result-btn${days[dayIndex]}" class="js-next-result-btn" value="${days[dayIndex]}"><i class="fas fa-chevron-circle-right"></i></button>
        <span id="ingredient-query${days[dayIndex]}" class="ingredient-query"></span>
        <!-- The Modal -->
        <div id="recipeModal" class="modal">

        <!-- Modal content -->
      <div class="modal-content">
          <span class="close">&times;</span>
          <h3 id="recipe-title${days[dayIndex]}">${result.title}</h3>
          <img id="card-image${days[dayIndex]}" class="modal-card-image" src="${result.image}" alt="${result.title} image">
          <span class="credit"></span>
          <section role="region" id="recipe-ingredients${days[dayIndex]}" class="recipe-ingredients">
          </section>  
          <section role="region" id="recipe-instructions${days[dayIndex]}" class="recipe-instructions">
          </section>     
        </div>
      </div>
    </div>
`
}


function renderDayCard(result, day) {  
  day = `${day}`
  return `
      <h3 class="recipe-title">${result.title}</h3>
      <p>Calories: ${result.calories}</p>
      <p>Protein: ${result.protein}</p>
      <img id="card-image${days}" class="card-image" src="${result.image}" alt="${result.title}">
      <button id="js-view-recipe-btn" class="js-view-recipe-btn" value="${result.id}">View Recipe</button>
`
}

function displayRecipesForWeek(data, offset) {
  const results = data.results.map((item, offset, index) => renderMenu(offset, item));
  $('.js-search-results').html(results);
  // Get the modal
let modal = document.getElementById('recipeModal');


// Get the button that opens the modal
let btn = document.getElementById("js-view-recipe-btn");

// Get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
    let recipeId = $(this).val();
    getRecipeInfo(recipeId);
    console.log(`${recipeId}`)
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
}



function watchBeginClick() {
  $('.js-begin-btn').click(event => {
    event.preventDefault();
    $('.js-select-diet').prop('hidden', false);
    $('.js-intro').prop('hidden', true);
    });
}


function watchDietSubmit() {
  $('.js-select-diet').submit(event => {
    event.preventDefault();
    let userAnswer = $('input[name=selectDiet]:checked').val()
    if (userAnswer === 'yes') {
      $('.js-select-diet').prop('hidden', true);
      $('.js-select-diet').prop('hidden', false);
    } else {
      $('.js-select-diet').remove();
      $('.js-select-days').prop('hidden', false);

    }
  });
}


function watchDietSelection() {
  $('.js-select-diet').submit(event => {
    event.preventDefault();
    $('.js-select-diet').prop('hidden', true);
    $('.js-select-days').prop('hidden', false);
  });
}

function watchMenuSubmit() {
  $('.js-select-diet').submit(event => {
    event.preventDefault();
    $('.js-select-days').prop('hidden', true);
    $('.js-output').prop('hidden', false);
    $('.js-menu-controls').prop('hidden', false);
    
    dietFilter = ''//filterTarget.val();
    allergyList = ['dairy']
    getRecipesForWeek(allergyList, dietFilter);
  });
}

function watchSearchByIngredientClick() {
  $('.js-output').on('click', '.search-by-ingredient-btn', function(event) {
  event.preventDefault();
  let day = $(this).val();
  let ingredient = $(`#search-by-ingredient${day}`).val();
  $(`#ingredient-query${day}`).text(`Result for ${ingredient}`)
  dietFilter = ''
  allergyList = ['']
  offset = Math.floor(Math.random() * 200)
  getRecipeForDay(allergyList, dietFilter, day, ingredient, offset);
  console.log(`${day} ${ingredient} option pressed`)
  })
}

function watchNextResultClick() {
  $('.js-output').on('click', '.js-next-result-btn', function(event) {
  event.preventDefault();
  let day = $(this).val()
  let ingredient = ''
  dietFilter = ''
  allergyList = ['dairy']
  offset ++
  getRecipeForDay(allergyList, dietFilter, day, ingredient, offset);
  console.log(`${day} ${ingredient} option pressed`)
  })
}

function watchPreviousResultClick() {
  $('.js-output').on('click', '.js-previous-result-btn', function(event) {
  event.preventDefault();
  let day = $(this).val()
  let ingredient = ''
  dietFilter = ''//filterTarget.val();
  allergyList = ['dairy']
  offset = initialOffset
  getRecipeForDay(allergyList, dietFilter, day, ingredient, offset);
  console.log(`${day} ${ingredient} option pressed`)
  })
}

function renderDayCard(result, day) {  
  return `
        <h3 id="recipe-title${day}" class="recipe-title">${result.title}</h3>
        <p id="calories${day}"">Calories: ${result.calories}</p>
        <p id="protein${day}">Protein: ${result.protein}</p>
      <img id="card-image${day}" class="card-image" src="${result.image}" alt="${result.title}">


`
$('js-view-recipe-btn').value = `${result.id}`
}

function watchRemoveClick() {
   $('.js-output').on('click', '.js-remove-day', function(event) {
  event.preventDefault();
  let day = $(this).val()
  let ingredient = ''
  dietFilter = ''
  allergyList = ['']
  $(`#${day}Card`).html(renderNotCooking(day));
  console.log(`${day} ${ingredient} option pressed`)
  })
}

function renderNotCooking(day) {  
  return `
        <h3 id="recipe-title${day}" class="recipe-title">Not Cooking</h3>
        <p id="calories${day}""> </p>
        <p id="protein${day}"></p>
      <img id="card-image${day}" class="card-image" src="https://www.displayfakefoods.com/store/pc/catalog/2189-lg.jpg" alt="Not cooking image">

`}

function watchStartOver() {
  $('.js-menu-controls').on('click', '.js-start-over', function(event) {
    event.preventDefault();
    console.log("refresh clicked")
    location.reload();
  })
}

function watchRefreshMenuClick() {
  $('.js-menu-controls').on('click', '.js-refresh-menu', function(event) {
    dietFilter = ''
    allergyList = ['']
    dayIndex -= 7
    getRecipesForWeek(allergyList, dietFilter);
})
}


function handleMenuGenerator() {
  watchBeginClick();
  watchDietSubmit();
  watchDietSelection();
  watchMenuSubmit();
  watchSearchByIngredientClick();
  watchNextResultClick();
  watchPreviousResultClick();
  watchRemoveClick();
  watchRefreshMenuClick();
  watchStartOver()
}

$(handleMenuGenerator)





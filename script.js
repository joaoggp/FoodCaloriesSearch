document.getElementById('query-calories').addEventListener('click', function () {
    queryCalories();
});

document.getElementById('name-food').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        queryCalories();
    }
});

let foodTranslations = {}

async function loadTranslations() {
    try {
        const response = await fetch('foodTranslations.json')
        foodTranslations = await response.json()
        console.log('Banco de Dados Carregado', foodTranslations)
    } catch (error) {
        console.error('Houve um erro ao carregar o banco de dados')
    }
}

loadTranslations()

function translateTextLocally(text) {
    let lowerCaseText = text.toLowerCase()
    return foodTranslations[lowerCaseText] || text
}

async function queryCalories() {
    const apiKey = 'c42ff93034634256342de0997a7618ff'; // Chave de API
    const appId = 'dd0f0841'; // ID de Aplicativo
    let foodName = document.getElementById('name-food').value;
    const gramsSpan = document.getElementById('grams-span');

    if (!foodName) {
        gramsSpan.textContent = 'Por favor, insira o nome de um alimento.'.toUpperCase();
        clearAlertAfterDelay(gramsSpan);
        return;
    }

    foodName = translateTextLocally(foodName)
    console.log('Nome do Alimento traduzido: ', foodName)

    const url = `https://trackapi.nutritionix.com/v2/natural/nutrients`;
    const params = {
        query: foodName,
        timezone: 'US/Eastern'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-app-id': appId,
                'x-app-key': apiKey
            },
            body: JSON.stringify(params)
        });

        const data = await response.json();
        if (data.foods && data.foods.length > 0) {
            const food = data.foods[0];
            document.getElementById('calories-kcal').value = food.nf_calories; // Insere o valor no campo de entrada
            if (gramsSpan) {
                gramsSpan.textContent = `${food.serving_weight_grams} GRAMAS `.toUpperCase(); // Insere o valor no span
                clearAlertAfterDelay(gramsSpan);
            }
        } else {
            gramsSpan.textContent = 'Alimento não encontrado. Tente outro nome.'.toUpperCase();
            clearAlertAfterDelay(gramsSpan);
        }
    } catch (error) {
        gramsSpan.textContent = 'Erro ao consultar as calorias. Tente novamente mais tarde.'.toUpperCase();
        clearAlertAfterDelay(gramsSpan);
    }
}

document.getElementById('btn-add-food').addEventListener('click', function () {
    addFood();
});

function addFood() {
    const foodName = document.getElementById('name-food').value;
    const calories = document.getElementById('calories-kcal').value;
    const grams = document.getElementById('grams-span').textContent.split(' ')[0];
    const table = document.querySelector('.food-table tbody');
    const spanDiv = document.getElementById('grams-span');

    if (!foodName || !calories) {
        spanDiv.textContent = 'Por favor, informe o nome do alimento e as calorias, ou use o botão consultar'.toUpperCase();
        clearAlertAfterDelay(spanDiv);
        return;  // Interrompe a execução da função se os campos não estiverem preenchidos
    }

    const newRow = table.insertRow();
    const nameCell = newRow.insertCell(0);
    const caloriesCell = newRow.insertCell(1);
    const gramsCell = newRow.insertCell(2);
    const removeCell = newRow.insertCell(3);

    nameCell.textContent = foodName.toUpperCase()
    caloriesCell.textContent = calories;
    gramsCell.textContent = grams;
    removeCell.innerHTML = '<button id="removebtn" onclick="removeFood(this)">X</button>';

    // Limpa os campos após adicionar o alimento
    document.getElementById('name-food').value = '';
    document.getElementById('calories-kcal').value = '';
    spanDiv.textContent = '';
}

function removeFood(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function clearAlertAfterDelay(element) {
    setTimeout(function () {
        element.textContent = '';
    }, 9000);
}

import * as data from "../helpers/default_data.json";
import * as login_page from "../locators/login_page.json";
import * as list_of_pokemons from "../locators/list_pokemon_page.json";
import * as trainer_page from "../locators/trainer_page.json";
import * as shop_trainers from "../locators/shop_trainers.json";
import * as terminal from "../locators/terminal.json"

describe('Проверка UX', function () {
    beforeEach ('Начало теста', function () {    
        cy.visit('/');
        cy.get(login_page.login_button).should('have.css', 'color','rgb(255, 255, 255)');// Проверка кнопки на цвет
        cy.get(login_page.login_button).should('have.css', 'background-color','rgb(237, 111, 45)');// Проверка кнопки на цвет при наведении
    })
    it('Проверяем UX', function () {
        
        cy.get(login_page.email).type(data.login);// Ввел логин
        cy.get(login_page.password).type(data.password);// Ввел пароль
        cy.intercept('v2/pokemons?sort=asc_date&status=1&page=1').as('main_page') //Перехватываем прогрузку страницы с Покемонами
        cy.get(login_page.login_button).click(); //Нажимаем на кнопку логина
        cy.wait('@main_page').then(({response})=>{ //Ожидаем прогрузку страницы и проводим проверки ниже
            expect(response.statusCode).to.eq(200);// Проверка статуса ответа 
            expect(response.body.data).to.have.length(60); // Проверка пагинации
        })
        cy.get(list_of_pokemons.title).contains('Покемоны').should('be.visible'); //Проверка текста Покемоны
        cy.intercept('**battle_history_request**').as('trainer_page'); // Перехват перехода
        cy.get(list_of_pokemons.trainer_button).click(); //Переход на страничку тренера
        cy.wait('@trainer_page'); // Ожидание перехода
        cy.get(trainer_page.export_title).contains('Экспорт истории битв'); // Проверка надписи Экспорт истории битв
        cy.intercept('**v2/debug_menu/get_avatars**').as('avatars_list'); // Перехват перехода
        cy.get(trainer_page.change_avatar_button).click(); // Переход на страничку покопки тренеров
        cy.wait('@avatars_list'); // Перехват перехода
            const randnomIndex = Math.floor(Math.random()*10+1); // Генерация рандомного индекса
            const random_trainer_card_with_random_index = shop_trainers.random_trainer_card.replace('{index}',randnomIndex); // Замена индекса на рандомный
        cy.get(random_trainer_card_with_random_index).click(); // Выбор рандомной карточки
        cy.get(terminal.header).contains("Пикачунькофф"); // Проверка перехода
        cy.get(terminal.back_image).should('be.visible'); 
        cy.get(terminal.card_number).type(data.card_number_text); // Вводим номер
        cy.get(terminal.card_date).type(data.card_date_text); // Вводим срок действия карты
        cy.get(terminal.CCV).type(data.CCV_text); // Вводим CCV
        cy.get(terminal.card_name).type(data.card_name_text); // Вводим ФИ
        cy.get(terminal.button_pay).click() // Нажимаем оплатить
        cy.get(terminal.Header_SMS) // Проверяем переход на страничу СМС
            .contains("Подтверждение покупки")
            .should('be.visible');
        cy.get(terminal.SMS).type(data.SMS); // вводим смс
        cy.get(terminal.button_pay_sms).click(); // Нажимаем оплатить после ввода смс
        cy.get(terminal.succes_payment_text) // Проверка успеха оплаты
            .should('be.visible')
            .contains("Покупка прошла успешно"); 
    })
})

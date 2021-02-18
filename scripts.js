
const Modal = {
    open() {
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close() {
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transactions = {
    all: Storage.get(),
    // [
    //     {
    //         id: 1,
    //         description: 'Luz',
    //         amount: -50000,
    //         date: '23/01/2021'
    //     },
    //     {
    //         id: 2,
    //         description: 'Criação website',
    //         amount: 500000,
    //         date: '23/01/2021'
    //     },
    //     {  
    //         id: 3,
    //         description: 'Internet',
    //         amount: -20000,
    //         date: '23/01/2021'
    //     }
    // ],
    add(transaction){
        Transactions.all.push(transaction)
        App.reload()
    },

    remove(index) {
        Transactions.all.splice(index, 1)
        App.reload()
    },

    incomes () {
        let income = 0
        Transactions.all.forEach((item) => {
            if(item.amount > 0){
                income = income + item.amount //income += item.amount
            }
        })
        return income
    },

    expenses () {
        let expense = 0
        Transactions.all.forEach((item) => {
            if(item.amount < 0){
                expense += item.amount 
            }
        })
        return expense
    }, 

    total () {
        return Transactions.incomes() + Transactions.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transactions,index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transactions, index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transactions, index) {

        const CSSClass = transactions.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transactions.amount)

        const html = `
            <td class="description">${transactions.description}</td>
            <td class= "${CSSClass}">${amount}</td>
            <td class="date">${transactions.date}</td>
            <td>
                <img onClick="Transactions.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
    `
    return html
    }, 

    updateBalance () {
        document
            .querySelector("#incomeDisplay")
            .innerHTML = Utils.formatCurrency(Transactions.incomes())
        document
            .querySelector("#expenseDisplay")
            .innerHTML = Utils.formatCurrency(Transactions.expenses())
        document
            .querySelector("#totalDisplay")
            .innerHTML = Utils.formatCurrency(Transactions.total())
    },

    clearTransactions () { //Limpa para não duplicar qd inserir novas transações
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/g, "")// usando a regex que pega todo o conteúdo e transfomra em número puro, isto é pega o que não é número e substitui por ""
        value = Number(value)/100

        value = value.toLocaleString("pt-BR", { //transformando em moeda Real
            style: "currency",
            currency: "BRL"
        }) 
        return signal + value
        console.log(value);
    },
    formatAmount(value) {
        value = Number(value) * 100
        
        return value
    }, 
    formatDate(date) {
        const formatDate = date.split('-') //retirando os '-' do formato da data
        return `${formatDate[2]}/${formatDate[1]}/${formatDate[0]}`
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return{
            description: Form.description.value, 
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        //desestruturando o getValues
        const { description, amount, date } = Form.getValues()
        if(
            description.trim() === '' ||
            amount.trim() === '' ||
            date.trim() === ''
            ) {
                throw new Error('Preencha todos os campos')
        }
    },

    formatData() {
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        
        return {
            description:description,
            amount: amount,
            date: date
        }
    },
    save(transaction) {
        Transactions.add(transaction)
    },
    clearFields(){
        Form.description.value='',
        Form.amount.value='',
        Form.date.value=''
    },

    submit(event) {
        event.preventDefault()

        try {
            //verificar infos preenchidaS
            Form.validateFields()
            //formatar dados
            const transaction = Form.formatData()
            //salvar dados
            Form.save(transaction)
            //apagar o que foi preenchido
            Form.clearFields()
            //modal fecha
            Modal.close()
            //atualizar os dados na aplicação
            // App.reload() na função de adicionar já tem o reload
        } catch (error) {
            alert(error.message)
        }
        
    }
}


const App = {
    init(){
        Transactions.all.forEach((transactions, index) => {
            DOM.addTransaction(transactions, index)
        })
        DOM.updateBalance()
        Storage.set(Transactions.all)
    },
    reload (){
        DOM.clearTransactions()
        App.init()
    }
}

App.init()



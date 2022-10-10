# Find-on-Database 🖥️

>Vamos primeiramente ao problema que deve ser solucionado, eu trabalho em uma empresa que utiliza muito código legado, baseado em Delphi e Firebird, e nossos sistemas possuim bases de dados monstruosamente grandes, e um tanto quanto mal organizadas, quando um dos técnicos vai fazer alguma correção, existe um trabalho imenso para localizar qual tabela ele deve alterar, qual coluna, e algo que facilitaria bastante seria localizar uma coluna por determinado registro, por exemplo: Eu sei que o valor que está no banco de Dados é: "José Luiz Antônio Boasnovas", qual coluna e em qual tabela esse valor está armazenado? 

Posteriormente eu vou implementar algumas funções de _Listeners_, para identificar as tabelas que sofreram alterações em determinado espaço de tempo, algumas funções de descriptografia, um pequeno banco de memória, e tudo isso, para ser facilmente utilizado pelos técnicos, vai possuir uma interface gráfica linda construida e em _Electron_.

### **Bora programar então!!🚀👨‍💻**

![Gatinho de Óculos olhando pro Notebook](https://c.tenor.com/29Ok5pc0ivAAAAAd/gatinho-gato.gif)

<hr>

## Observações Legais

### Node-Firebird (Meu Salva-Vidas)♒

Como já disse, trabalho com tecnologias bem antigas, não porque quero, mas, preciso me virar com o que tenho, e pra mim, não é vantajoso aprender a programar em Pascal só pra fazer Duplinha com o Firebird como era a 20 anos atrás, todavia algum sujeito muito bondozo criou essa Lib fantástica que me permite conectar em bancos Firebird utilizando o Node.JS

[Link para o página Inicial do repositório do Projeto](https://github.com/hgourvest/node-firebird)

**Não recomendo ninguém a utilizar Firebird pelo século XXI! Não façam isso! Por mais que Firebird seja gratuito e consideravelmente leve, ele possui graves falhas de Segurança. Como uma vez disse o sábio:**

>Não é o mais forte que sobrevive, nem o mais inteligente, mas o que melhor se adapta às mudanças. (MEGGINSON, 1963)
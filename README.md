# GERAR UM ARQUIVO COM AS REQUESTS DO PROJETO NO INSOMNIA

Para inicializar o projeto
$ yarn init -y

Para testar e rodar o arquivo que cria o servidor
$ node src/server.js

$ yarn add express

$ node ./src/server.js

$ yarn add sucrase nodemon -D

// usa depois de adicionar o sucrase mudar de require para import

$ yarn sucrase-node src/server.js


No arquivo nodemon.json usa essa estrutura para registrar o sucrase para todos os arquivos js antes de rodar o node
```
{
  "execMap": {
    "js": "node -r sucrase/register"
  }
}
```

quando usa o sucrase o processo de debug muda um pouco tambem precisa adicionar comandos no package.json
```
"scripts": {
    "dev": "nodemon src/server.js",
    "dev:debug": "nodemon --inspect src/server.js"
},
```

Comando que cria um servico de banco de dados postgres
https://hub.docker.com/_/postgres
$ docker run --name database -e POSTGRES_PASSWORD=docker -p 5432:5432 -d postgres

Lista os containers que estão em execução
$ docker ps

Para a database de forma brusca
$ docker stop database

Lista todos os containers que tem na maquina mesmo os que nao estao rodando
$ docker ps -a

Para executar o docker. database é o nome
$ docker start database

Para listar todos os logs da database
$ docker logs database

Para adicionar o eslint ao codigo. Verifica os padroes de codigo
$ yarn add eslint -D
$ yarn eslint --init
  * To ckeck syantax, find problems, and enforce code style
  * JavaScript modules
  * Node of these
  * No
  * Node
  * Use a popular guider
  * Airbnb: https://github.com/airbnb/javascript
  * JavaScript

depois de selecionar as opcoes vai criar um arquivo package-lock.json, pois faz a instalacao da dependencias com o npm.
Então se exclui esse arquivo e roda $ yarn no prompt.
Assim ele faz o mapeamento das dependencias.
Precisa fazer algumas configuracoes no arquivo setting.json e adiconar algumas rules no arquivo que é gerado eslintrc.js


Para deixar o codigo mais bonito usa
$ yarn add prettier eslint-config-prettier eslint-plugin-prettier -D

depois configura mais umas coisas no .eslintrc.js

$ yarn eslint --fiz src --ext .js
Usa esse comando para arrumar todos os erros dos arquivos de uma pasta

precisa criar o editorconfig com o botao direito na raiz do projeto

$ yarn add sequelize
$ yarn add sequelize-cli -D

para criar a migração. Usada para criar a tabela de usuarios
$ yarn sequelize migration:create --name=create-user

para rodar a migration
$ yarn sequelize db:migrate

para desfazer uma migration
$ yarn sequelize db:migrate:undo

para desfazer todas migration
$ yarn sequelize db:migrate:undo:all

para criptografar a senha adicinar a dependencia
$ yarn add bcryptjs

adicionando a parte do token
$ yarn add jsonwebtoken

Para validar os campos que recebe pela api usa-se a dependencia yup
Ele usa o schema validation
$ yarn add yup

# MODULO 03

  * Para fazer upload de arquivos precisa de uma biblioteca que consiga lidar com tipo de corpos diferentes, alem do formato json.
  * Precisa enviar no formato multipart Form data
  > yarn add multer
  * Após cria uma pasta na raiz chamada tmp com uma pasta interna chamada uploads.
  * Cria um arquivo `multer.js` na pasta config

  * Criar uma tabela nova na database para guardar a referencia das imagens
  > yarn sequelize migration:create --name=create-files
  * Preenche o arquivo
  > yarn sequelize db:migrate
  * cria o model File.js

  * Precisa adicionar um campo com o nome do arquivo na tabela de usuarios, para isso criamos uma nova migration
  > yarn sequelize migration:create --name=add-avatar-field-to-users
  * Preenche o arquivo com o novo campo na tabela. esse campo é uma chave estrangeira.
  > yarn sequelize db:migrate

  * Agora é necessário relacionar o model de user com o model de file.
  * Após fazer a associação precisa mapear essa associação dentro do arquivo index da pasta database.

  * Criação da migration que cria a tabela de agendamentos
  > yarn sequelize migration:create --name=create-appointments

  * library para lidar com datas
  > yarn add date-fns@next

  * Criação de um banco de dados não relacional com mongodb
  > docker run --name mongobarber -p 27017:27017 -d -t mongo
  * Para se certificar que está tudo certo pode rodar
  > docker ps
  * E acessar o end 192.168.99.100:27017 (não é localhost por causa do docker toolbox)

  * Adicionar mongoose para lidar com a database
  > yarn add mongoose

  * criar a pasta schemas que representam os models só que do mongo,
  * pois no mongo não tem tabela, somente schemas, onde os dados não são estruturados,
  * isso quer dizer que registros de um mesmo schema podem ter numero de campos diferentes

  * Com o mongodb não tem como garantir se os dados não foram atualizados, pois ele não guarda
  * a origem dos dados, guarda eles de forma estatica, ou seja se o usuario atualizar o nome,
  * a mensagem que ele mandou antes e foi armazenada no mongodb vai continuar com o nome antigo.
  * A vantagem, é que dessa forma se ganha muita performace.

  * Instalar dependências para envio de email
  > yarn add nodemailer
  * Usaremos mailtrap para os emails, porem só funciona em ambiente de desenvolvimento

  * Criar uma pasta lib onde se configuram coisas a mais da aplicacao

  * Para estilizar o email que esta sendo enviado, adicionar duas dependências.
  * Vão permitir usar um template engine e receber variaveis do node.
  > yarn add express-handlebars
  > yarn add nodemailer-express-handlebars

  * o partials são mensagens que se repetem em mais de um template

  * configurar as filas ou background jobs
  * Para isso é preciso de um banco chave/valor como redis
  > docker run --name redisbarber -p 6379:6379 -d -t redis:alpine
  * Precisa instalar a depencia bee-queue responsavel por gerenciar as filas
  > yarn add bee-queue

  * para monitorar exceções
  * criar conta no [Sentry](https://sentry.io/)
  * Adicionar um dependência
  > yarn add @sentry/node@5.12.2

  * Como as funções são assíncronas o express não consegue pegar os erros e mandar para o sentry
  * Para resolver isso
  > yarn add express-async-errors
  * Faz a tratativa do erros para dar uma vizualização melhor para o desenvolvedor
  > yarn add youch

  * Criar um arquivo `.env` com as variaveis de ambiente do projeto
  * Adicionar a dependência
  > yarn add dotenv
  * Depois importa `import 'dotenv/config'` nos arquivos que precisar
  * Isso cria carrega as variavies de ambiente dentro de uma variavel global do node chamada `process.env`


const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');

const packageDefinition = protoLoader.loadSync('books.proto');
const booksProto = grpc.loadPackageDefinition(packageDefinition).books;

const client = new booksProto.BookService('0.0.0.0:50051', grpc.credentials.createInsecure());

function printResponse (error, response) {
    if (error) console.error('Error : ', error);
    else console.log(response);
}

function listBooks() {
    client.list({}, (error, books) => printResponse(error, books))
}

function insertBook([ id, title, author ]) {
    const book = { id: parseInt(id), title, author };
    client.insert(book, (error, empty) => printResponse(error, empty))
}

function getBook([ id ]) {
    client.get({ id: parseInt(id) }, (error, book) => printResponse(error, book));
}

function deleteBook([ id ]) {
    client.delete({ id: parseInt(id) }, (error, empty) => printResponse(error, empty));
}

function watchBooks() {
    const call = client.watch({});
    call.on('data', (book) => console.log(book));
}

const { argv } = process;
const processName = argv.shift();
const scriptName = argv.shift();
const command = argv.shift();

if (command === 'list')         listBooks();
else if (command === 'insert')  insertBook(argv);
else if (command === 'get')     getBook(argv);
else if (command === 'delete')  deleteBook(argv);
else if (command === 'watch')   watchBooks();

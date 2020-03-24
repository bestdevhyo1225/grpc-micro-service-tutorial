const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');

const packageDefinition = protoLoader.loadSync('books.proto');
const booksProto = grpc.loadPackageDefinition(packageDefinition).books;

const server = new grpc.Server();

const books = [
    { id: 123, title: 'A Tale of Two Cities', author: 'Charles Dickens' }
];

server.addService(booksProto.BookService.service, {
    list: (call, callback) => { callback(null, { books }); }
});

server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());

console.log('Server running at http://0.0.0.0:50051');

server.start();

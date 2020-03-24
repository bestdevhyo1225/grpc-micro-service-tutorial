const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');

const packageDefinition = protoLoader.loadSync('books.proto');
const booksProto = grpc.loadPackageDefinition(packageDefinition).books;

const server = new grpc.Server();

const books = [
    { id: 123, title: 'A Tale of Two Cities', author: 'Charles Dickens' }
];

server.addService(booksProto.BookService.service, {
    list: (call, callback) => {
        callback(null, { books });
    },
    insert: (call, callback) => {
        books.push(call.request);
        callback(null, {});
    },
    get: (call, callback) => {
        const { id: reqId } = call.request;
        const book = books.find(({ id }) => id === reqId);
        if (book) return callback(null, book);
        callback({ code: grpc.status.NOT_FOUND, details: 'Not found' });
    },
    delete: (call, callback) => {
        const { id: reqId } = call.request;
        const index = books.findIndex(({ id }) => id === reqId);
        if (index >= 0) {
            books.splice(index, 1);
            return callback(null, {});
        }
        callback({ code: grpc.status.NOT_FOUND, details: 'Not found' });
    }
});

server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());

console.log('Server running at http://0.0.0.0:50051');

server.start();

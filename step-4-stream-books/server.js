const protoLoader = require('@grpc/proto-loader');
const grpcLibrary = require('grpc');
const events = require('events');

const packageDefinition = protoLoader.loadSync('books.proto');
const booksProto = grpcLibrary.loadPackageDefinition(packageDefinition).books;

const server = new grpcLibrary.Server();
const bookStream = new events.EventEmitter();

const books = [
    { id: 123, title: 'A Tale of Two Cities', author: 'Charles Dickens' }
];

server.addService(booksProto.BookService.service, {
    list: (call, callback) => {
        callback(null, { books });
    },
    insert: (call, callback) => {
        const book = call.request;
        books.push(book);
        bookStream.emit('new_book', book);
        callback(null, {});
    },
    get: (call, callback) => {
        const { id: reqId } = call.request;
        const book = books.find(({ id }) => id === reqId);
        if (book) return callback(null, book);
        callback({ code: grpcLibrary.status.NOT_FOUND, details: 'Not found' });
    },
    delete: (call, callback) => {
        const { id: reqId } = call.request;
        const index = books.findIndex(({ id }) => id === reqId);
        if (index >= 0) {
            books.splice(index, 1);
            return callback(null, {});
        }
        callback({ code: grpcLibrary.status.NOT_FOUND, details: 'Not found' });
    },
    watch: (stream) => {
        bookStream.on('new_book', (book) => stream.write(book));
    }
});

server.bind('0.0.0.0:50051', grpcLibrary.ServerCredentials.createInsecure());

console.log('Server running at http://0.0.0.0:50051');

server.start();

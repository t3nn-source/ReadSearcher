import {User} from '../models/index.js';
import { AuthenticationError, signToken } from '../services/auth.js';

export default{
    Query: {
        me : async (_: any, __: any, context: any) => {
            if (context.user) {
                const user = await User.findById(context.user._id).select('-__v -password').populate('savedBooks');
                return user;
            }
            throw new AuthenticationError('Not logged in!');
        }

    },
    Mutation: {
        login: async (_: any, { email, password }: any) => {
              const user = await User.findOne({ $or: [{ email: email }] });
              if (!user) {
                throw new AuthenticationError('Incorrect credentials!');
              }
            
              const correctPw = await user.isCorrectPassword(password);
            
              if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials!');
              }
              const token = signToken(user.username, user.password, user._id);
              return { token, user };
        },
        addUser: async (_: any, { username, email, password }: any) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user.username, user.password, user._id);
            return { token, user };
        },
        saveBook: async (_: any, { book }: any, context: any) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: book } },
                    { new: true, runValidators: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async (_: any, { bookId }: any, context: any) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    },
}
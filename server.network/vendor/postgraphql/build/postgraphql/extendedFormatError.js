"use strict";
/**
 * Given a GraphQLError, format it according to the rules described by the
 * Response Format, Errors section of the GraphQL Specification, plus a few
 * additional fields relevant to postgres errors, including HINT, DETAIL,
 * and ERRCODE.
 */
function extendedFormatError(error, fields) {
    if (!error) {
        throw new Error('Received null or undefined error.');
    }
    var originalError = error.originalError;
    return {
        message: error.message,
        locations: error.locations,
        path: error.path,
        hint: originalError && fields.indexOf('hint') > -1 ? originalError.hint : undefined,
        detail: originalError && fields.indexOf('detail') > -1 ? originalError.detail : undefined,
        errcode: originalError && fields.indexOf('errcode') > -1 ? originalError.code : undefined,
    };
}
exports.extendedFormatError = extendedFormatError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5kZWRGb3JtYXRFcnJvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wb3N0Z3JhcGhxbC9leHRlbmRlZEZvcm1hdEVycm9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQTs7Ozs7R0FLRztBQUNILDZCQUFvQyxLQUFtQixFQUFFLE1BQXFCO0lBQzVFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQTtJQUN0RCxDQUFDO0lBQ0QsSUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLGFBQXFDLENBQUE7SUFDakUsTUFBTSxDQUFDO1FBQ0wsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO1FBQ3RCLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUztRQUMxQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7UUFDaEIsSUFBSSxFQUFFLGFBQWEsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxJQUFJLEdBQUcsU0FBUztRQUNuRixNQUFNLEVBQUUsYUFBYSxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsYUFBYSxDQUFDLE1BQU0sR0FBRyxTQUFTO1FBQ3pGLE9BQU8sRUFBRSxhQUFhLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxhQUFhLENBQUMsSUFBSSxHQUFHLFNBQVM7S0FDMUYsQ0FBQTtBQUNILENBQUM7QUFiRCxrREFhQyJ9
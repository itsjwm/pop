"use strict";
var tslib_1 = require("tslib");
var utils_1 = require("../../utils");
var pgClientFromContext_1 = require("../pgClientFromContext");
/**
 * The `PgPaginatorOrderingOffset` implements an ordering strategy based solely
 * off of integer Sql offsets. This strategy is faster in some respects than
 * `PgPaginatorOrderingAttribute`, however it can easily be less correct.
 * Whenever an item is inserted into a set anywhere but at the end, all of the
 * offsets change making cursors previously queried now inconsistent with the
 * data.
 *
 * This ordering is available to be used with procedures and views (which will
 * often have a natural ordering), as well as indexes which define a custom
 * ordering. However, the cursors still won’t be super consistent.
 *
 * Also, note that there is no implementation for `getCursorForValue`. In the
 * future, we may add an implementation in the future but there it is hard
 * to get an offset from a lone value.
 */
var PgPaginatorOrderingOffset = (function () {
    function PgPaginatorOrderingOffset(config) {
        this.pgPaginator = config.pgPaginator;
        this.orderBy = config.orderBy;
    }
    /**
     * Reads a single page using the offset ordering strategy.
     */
    PgPaginatorOrderingOffset.prototype.readPage = function (context, input, config) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var client, first, last, beforeCursor, afterCursor, _offset, _count, getCount, offset, limit, _a, _b, _c, _d, aliasIdentifier, cteIdentifier, fromSql, conditionSql, query, rows, values, _e, _f, _g, _h;
            return tslib_1.__generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        client = pgClientFromContext_1.default(context);
                        first = config.first, last = config.last, beforeCursor = config.beforeCursor, afterCursor = config.afterCursor, _offset = config._offset;
                        // Do not allow `first` and `last` to be defined at the same time. THERE
                        // MAY ONLY BE 1!!
                        if (first != null && last != null)
                            throw new Error('`first` and `last` may not be defined at the same time.');
                        // Disallow the use of `offset` with `last`. We are currently still
                        // evaluating how best to implement paginators and offsets, trying to
                        // support `last` and `offset` adds complexity we don’t need.
                        if (_offset != null && last != null)
                            throw new Error('`offset` may not be used with `last`.');
                        // Check that the types of our cursors is exactly what we would expect.
                        if (afterCursor != null && !Number.isInteger(afterCursor))
                            throw new Error('The after cursor must be an integer.');
                        if (beforeCursor != null && !Number.isInteger(beforeCursor))
                            throw new Error('The before cursor must be an integer.');
                        getCount = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(_count == null)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this.pgPaginator.count(context, input)];
                                    case 1:
                                        _count = _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/, _count];
                                }
                            });
                        }); };
                        if (!(last == null || (last != null && beforeCursor != null && beforeCursor - (afterCursor != null ? afterCursor : 0) <= last))) return [3 /*break*/, 1];
                        // Start selecting at the offset specified by `after`. If there is no
                        // after, we start selecting at the beginning (0).
                        //
                        // Also add our offset if given one.
                        offset = (afterCursor != null ? afterCursor : 0) + (_offset || 0);
                        // Next create our limit (what we will be selecting to relative to our
                        // `offset`).
                        limit =
                            beforeCursor != null ? Math.min((beforeCursor - 1) - offset, first != null ? first : Infinity) :
                                first != null ? first :
                                    null;
                        return [3 /*break*/, 5];
                    case 1:
                        if (!(beforeCursor != null)) return [3 /*break*/, 2];
                        _a = beforeCursor - last - 1;
                        return [3 /*break*/, 4];
                    case 2:
                        _c = (_b = Math).max;
                        return [4 /*yield*/, getCount()];
                    case 3:
                        _a = _c.apply(_b, [(_j.sent()) - last, afterCursor != null ? afterCursor : -Infinity]);
                        _j.label = 4;
                    case 4:
                        // Calculate the `offset` by doing some maths. We may need to get the
                        // count from the database on this one.
                        offset = _a;
                        // The limit should always simply be `last`. Except in one case, but
                        // that case is handled above.
                        limit = last;
                        _j.label = 5;
                    case 5:
                        aliasIdentifier = Symbol();
                        cteIdentifier = Symbol();
                        fromSql = this.pgPaginator.getFromEntrySql(input);
                        conditionSql = this.pgPaginator.getConditionSql(input);
                        query = utils_1.sql.compile((_e = ["\n      -- The query is wrapped with a CTE on which the to_json function is\n      -- applied. This ensures the to_json function is only called on the final\n      -- results of the query.\n      with ", " as (\n        select ", " as value\n        from ", " as ", "\n        where ", "\n        ", "\n        offset ", "\n        limit ", "\n      ) select to_json(", ".value) as value from ", ";\n    "], _e.raw = ["\n      -- The query is wrapped with a CTE on which the to_json function is\n      -- applied. This ensures the to_json function is only called on the final\n      -- results of the query.\n      with ", " as (\n        select ", " as value\n        from ", " as ", "\n        where ", "\n        ", "\n        offset ", "\n        limit ", "\n      ) select to_json(", ".value) as value from ", ";\n    "], utils_1.sql.query(_e, utils_1.sql.identifier(cteIdentifier), utils_1.sql.identifier(aliasIdentifier), fromSql, utils_1.sql.identifier(aliasIdentifier), conditionSql, this.orderBy ? (_f = ["order by ", ""], _f.raw = ["order by ", ""], utils_1.sql.query(_f, this.orderBy)) : (_g = [""], _g.raw = [""], utils_1.sql.query(_g)), utils_1.sql.value(offset), limit != null ? utils_1.sql.value(limit) : (_h = ["all"], _h.raw = ["all"], utils_1.sql.query(_h)), utils_1.sql.identifier(cteIdentifier), utils_1.sql.identifier(cteIdentifier))));
                        return [4 /*yield*/, client.query(query)];
                    case 6:
                        rows = (_j.sent()).rows;
                        values = rows.map(function (_a, i) {
                            var value = _a.value;
                            return ({
                                value: _this.pgPaginator.itemType.transformPgValueIntoValue(value),
                                cursor: offset + 1 + i,
                            });
                        });
                        // TODO: We get the count in this function (see `getCount`) to paginate
                        // correctly. We should create an optimization that allows us to share
                        // what the count is instead of calling for the count again.
                        return [2 /*return*/, {
                                values: values,
                                // We have super simple implementations for `hasNextPage` and
                                // `hasPreviousPage` thanks to the algebraic nature of ordering by
                                // offset.
                                hasNextPage: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { var _a; return tslib_1.__generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _a = offset + (limit != null ? limit : Infinity);
                                            return [4 /*yield*/, getCount()];
                                        case 1: return [2 /*return*/, _a < (_b.sent())];
                                    }
                                }); }); },
                                hasPreviousPage: function () { return Promise.resolve(offset > 0); },
                            }];
                }
            });
        });
    };
    return PgPaginatorOrderingOffset;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PgPaginatorOrderingOffset;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGdQYWdpbmF0b3JPcmRlcmluZ09mZnNldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9wb3N0Z3Jlcy9pbnZlbnRvcnkvcGFnaW5hdG9yL1BnUGFnaW5hdG9yT3JkZXJpbmdPZmZzZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxxQ0FBaUM7QUFDakMsOERBQXdEO0FBVXhEOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUNIO0lBS0UsbUNBQWEsTUFHWjtRQUNDLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQTtRQUNyQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUE7SUFDL0IsQ0FBQztJQUVEOztPQUVHO0lBQ1UsNENBQVEsR0FBckIsVUFDRSxPQUFjLEVBQ2QsS0FBYSxFQUNiLE1BQTBDOzs7Z0JBRXBDLE1BQU0sRUFDSixLQUFLLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsT0FBTyxFQW9CbkQsTUFBTSxFQUlKLFFBQVEsRUFPVixNQUFNLEVBQ04sS0FBSyxrQkF3Q0gsZUFBZSxFQUNmLGFBQWEsRUFDYixPQUFPLEVBQ1AsWUFBWSxFQUdaLEtBQUssUUFrQkwsTUFBTTs7OztpQ0FqR0csNkJBQW1CLENBQUMsT0FBTyxDQUFDO2dDQUNpQixNQUFNLGVBQU4sTUFBTSxzQkFBTixNQUFNLDZCQUFOLE1BQU0sd0JBQU4sTUFBTTt3QkFFbEUsd0VBQXdFO3dCQUN4RSxrQkFBa0I7d0JBQ2xCLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQzs0QkFDaEMsTUFBTSxJQUFJLEtBQUssQ0FBQyx5REFBeUQsQ0FBQyxDQUFBO3dCQUU1RSxtRUFBbUU7d0JBQ25FLHFFQUFxRTt3QkFDckUsNkRBQTZEO3dCQUM3RCxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUM7NEJBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQTt3QkFFMUQsdUVBQXVFO3dCQUN2RSxFQUFFLENBQUMsQ0FBQyxXQUFXLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQzs0QkFDeEQsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFBO3dCQUN6RCxFQUFFLENBQUMsQ0FBQyxZQUFZLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQzs0QkFDMUQsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFBO21DQU96Qzs7Ozs2Q0FDWCxDQUFBLE1BQU0sSUFBSSxJQUFJLENBQUEsRUFBZCx3QkFBYzt3Q0FDUCxxQkFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUE7O3dDQUFyRCxNQUFNLEdBQUcsU0FBNEMsQ0FBQTs7NENBRXZELHNCQUFPLE1BQU0sRUFBQTs7OzZCQUNkOzZCQWVHLENBQUEsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksWUFBWSxJQUFJLElBQUksSUFBSSxZQUFZLEdBQUcsQ0FBQyxXQUFXLElBQUksSUFBSSxHQUFHLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQSxFQUF4SCx3QkFBd0g7d0JBQzFILHFFQUFxRTt3QkFDckUsa0RBQWtEO3dCQUNsRCxFQUFFO3dCQUNGLG9DQUFvQzt3QkFDcEMsTUFBTSxHQUFHLENBQUMsV0FBVyxJQUFJLElBQUksR0FBRyxXQUFXLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUE7d0JBRWpFLHNFQUFzRTt3QkFDdEUsYUFBYTt3QkFDYixLQUFLOzRCQUNILFlBQVksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLEVBQUUsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLEdBQUcsUUFBUSxDQUFDO2dDQUM5RixLQUFLLElBQUksSUFBSSxHQUFHLEtBQUs7b0NBQ3JCLElBQUksQ0FBQTs7OzZCQU9KLENBQUEsWUFBWSxJQUFJLElBQUksQ0FBQSxFQUFwQix3QkFBb0I7d0JBQ2hCLEtBQUEsWUFBWSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUE7Ozt3QkFDdkIsS0FBQSxDQUFBLEtBQUEsSUFBSSxDQUFBLENBQUMsR0FBRyxDQUFBO3dCQUFDLHFCQUFNLFFBQVEsRUFBRSxFQUFBOzt3QkFBekIsS0FBQSxjQUFTLENBQUEsU0FBZ0IsSUFBRyxJQUFJLEVBQUUsV0FBVyxJQUFJLElBQUksR0FBRyxXQUFXLEdBQUcsQ0FBQyxRQUFRLEVBQUMsQ0FBQTs7O3dCQUx0RixxRUFBcUU7d0JBQ3JFLHVDQUF1Qzt3QkFDdkMsTUFBTSxLQUdnRixDQUFBO3dCQUV0RixvRUFBb0U7d0JBQ3BFLDhCQUE4Qjt3QkFDOUIsS0FBSyxHQUFHLElBQUksQ0FBQTs7OzBDQUdVLE1BQU0sRUFBRTt3Q0FDVixNQUFNLEVBQUU7a0NBQ2QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDO3VDQUNsQyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUM7Z0NBRzlDLFdBQUcsQ0FBQyxPQUFPLDJhQUFVLDJNQUkxQixFQUE2Qix3QkFDekIsRUFBK0IsMEJBQ2pDLEVBQU8sTUFBTyxFQUErQixrQkFDNUMsRUFBWSxZQUNsQixFQUFnRSxtQkFDekQsRUFBaUIsa0JBQ2xCLEVBQWlELDJCQUN4QyxFQUE2Qix3QkFBeUIsRUFBNkIsU0FDdkcsR0FaeUIsV0FBRyxDQUFDLEtBQUssS0FJMUIsV0FBRyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFDekIsV0FBRyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFDakMsT0FBTyxFQUFPLFdBQUcsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLEVBQzVDLFlBQVksRUFDbEIsSUFBSSxDQUFDLE9BQU8sc0NBQVksV0FBWSxFQUFZLEVBQUUsR0FBbkMsV0FBRyxDQUFDLEtBQUssS0FBWSxJQUFJLENBQUMsT0FBTywyQkFBYyxFQUFFLEdBQVgsV0FBRyxDQUFDLEtBQUssS0FBRSxFQUN6RCxXQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUNsQixLQUFLLElBQUksSUFBSSxHQUFHLFdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLDRCQUFZLEtBQUssR0FBZCxXQUFHLENBQUMsS0FBSyxLQUFLLEVBQ3hDLFdBQUcsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQXlCLFdBQUcsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEdBQ3RHO3dCQUdlLHFCQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUE7OytCQUF6QixDQUFBLFNBQXlCLENBQUE7aUNBSXhDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQyxFQUFTLEVBQUUsQ0FBQztnQ0FBVixnQkFBSzs0QkFBVSxPQUFBLENBQUM7Z0NBQzFCLEtBQUssRUFBRSxLQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUM7Z0NBQ2pFLE1BQU0sRUFBRSxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUM7NkJBQ3ZCLENBQUM7d0JBSHlCLENBR3pCLENBQUM7d0JBRUwsdUVBQXVFO3dCQUN2RSxzRUFBc0U7d0JBQ3RFLDREQUE0RDt3QkFDNUQsc0JBQU87Z0NBQ0wsTUFBTSxRQUFBO2dDQUNOLDZEQUE2RDtnQ0FDN0Qsa0VBQWtFO2dDQUNsRSxVQUFVO2dDQUNWLFdBQVcsRUFBRTs7OzRDQUFZLEtBQUEsTUFBTSxHQUFHLENBQUMsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLEdBQUcsUUFBUSxDQUFDLENBQUE7NENBQUcscUJBQU0sUUFBUSxFQUFFLEVBQUE7Z0RBQTlELHNCQUFBLE1BQThDLFNBQWdCLENBQUEsRUFBQTs7eUNBQUE7Z0NBQ3ZGLGVBQWUsRUFBRSxjQUFNLE9BQUEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQTNCLENBQTJCOzZCQUNuRCxFQUFBOzs7O0tBQ0Y7SUFDSCxnQ0FBQztBQUFELENBQUMsQUF4SUQsSUF3SUM7O0FBRUQsa0JBQWUseUJBQXlCLENBQUEifQ==
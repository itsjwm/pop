"use strict";
var tslib_1 = require("tslib");
var utils_1 = require("../../utils");
var pgClientFromContext_1 = require("../pgClientFromContext");
/**
 * The `PgPaginatorOrderingAttributes` paginator ordering implements an
 * ordering strategy that involves sorting on the attributes of a given
 * `PgObjectType`. We use the `<` and `>` operators in Postgres to implement
 * the before/after cursors and we also ordering using those operators.
 */
var PgPaginatorOrderingAttributes = (function () {
    function PgPaginatorOrderingAttributes(config) {
        this.pgPaginator = config.pgPaginator;
        this.descending = config.descending != null ? config.descending : false;
        this.pgAttributes = config.pgAttributes;
    }
    /**
     * Reads a single page for this ordering.
     */
    PgPaginatorOrderingAttributes.prototype.readPage = function (context, input, config) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var client, _a, descending, pgAttributes, beforeCursor, afterCursor, first, last, _offset, aliasIdentifier, cteIdentifier, fromSql, conditionSql, query, rows, values, _b, _c, _d;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        client = pgClientFromContext_1.default(context);
                        _a = this, descending = _a.descending, pgAttributes = _a.pgAttributes;
                        beforeCursor = config.beforeCursor, afterCursor = config.afterCursor, first = config.first, last = config.last, _offset = config._offset;
                        // Do not allow `first` and `last` to be defined at the same time. THERE
                        // MAY ONLY BE 1!!
                        if (first != null && last != null)
                            throw new Error('`first` and `last` may not be defined at the same time.');
                        // Disallow the use of `offset` with `last`. We are currently still
                        // evaluating how best to implement paginators and offsets, trying to
                        // support `last` and `offset` adds complexity we don’t need.
                        if (_offset != null && last != null)
                            throw new Error('`offset` may not be used with `last`.');
                        // Perform some validations on our cursors. If they do not pass these
                        // conditions, we should not proceed.
                        if (afterCursor != null && afterCursor.length !== pgAttributes.length)
                            throw new Error('After cursor must be a value tuple of the correct length.');
                        if (beforeCursor != null && beforeCursor.length !== pgAttributes.length)
                            throw new Error('Before cursor must be a value tuple of the correct length.');
                        aliasIdentifier = Symbol();
                        cteIdentifier = Symbol();
                        fromSql = this.pgPaginator.getFromEntrySql(input);
                        conditionSql = this.pgPaginator.getConditionSql(input);
                        query = utils_1.sql.compile((_b = ["\n      -- The query is wrapped with a CTE on which the to_json function is\n      -- applied. This ensures the to_json function is only called on the final\n      -- results of the query.\n      with ", " as (\n        -- The standard select/from clauses up top.\n        select ", " as value\n        from ", " as ", "\n\n        -- Combine our cursors with the condition used for this page to\n        -- implement a where condition which will filter what we want it to.\n        --\n        -- We throw away nulls because there is a lot of wierdness when they\n        -- get included.\n        where\n          ", " and\n          ", " and\n          ", " and\n          ", "\n\n        -- Order using the same attributes used to construct the cursors. If\n        -- a last property was defined we need to reverse our ordering so the\n        -- limit will work. We will fix the order in JavaScript.\n        order by ", "\n\n        -- Finally, apply the appropriate limit.\n        limit ", "\n\n        -- If we have an offset, add that as well.\n        ", "\n      ) select to_json(", ".value) as value from ", ";\n    "], _b.raw = ["\n      -- The query is wrapped with a CTE on which the to_json function is\n      -- applied. This ensures the to_json function is only called on the final\n      -- results of the query.\n      with ", " as (\n        -- The standard select/from clauses up top.\n        select ", " as value\n        from ", " as ", "\n\n        -- Combine our cursors with the condition used for this page to\n        -- implement a where condition which will filter what we want it to.\n        --\n        -- We throw away nulls because there is a lot of wierdness when they\n        -- get included.\n        where\n          ", " and\n          ", " and\n          ", " and\n          ", "\n\n        -- Order using the same attributes used to construct the cursors. If\n        -- a last property was defined we need to reverse our ordering so the\n        -- limit will work. We will fix the order in JavaScript.\n        order by ",
                            "\n\n        -- Finally, apply the appropriate limit.\n        limit ", "\n\n        -- If we have an offset, add that as well.\n        ", "\n      ) select to_json(", ".value) as value from ", ";\n    "], utils_1.sql.query(_b, utils_1.sql.identifier(cteIdentifier), utils_1.sql.identifier(aliasIdentifier), fromSql, utils_1.sql.identifier(aliasIdentifier), utils_1.sql.join(pgAttributes.map(function (pgAttribute) {
                            return (_a = ["", " is not null"], _a.raw = ["", " is not null"], utils_1.sql.query(_a, utils_1.sql.identifier(pgAttribute.name)));
                            var _a;
                        }), ' and '), beforeCursor ? this._getCursorCondition(pgAttributes, beforeCursor, descending ? '>' : '<') : utils_1.sql.raw('true'), afterCursor ? this._getCursorCondition(pgAttributes, afterCursor, descending ? '<' : '>') : utils_1.sql.raw('true'), conditionSql, utils_1.sql.join(pgAttributes.map(function (pgAttribute) {
                            return (_a = ["", " using ", ""], _a.raw = ["", " using ", ""], utils_1.sql.query(_a, utils_1.sql.identifier(pgAttribute.name), utils_1.sql.raw((last != null ? !descending : descending) ? '>' : '<')));
                            var _a;
                        }), ', '), first != null ? utils_1.sql.value(first) : last != null ? utils_1.sql.value(last) : utils_1.sql.raw('all'), _offset != null ? (_c = ["offset ", ""], _c.raw = ["offset ", ""], utils_1.sql.query(_c, utils_1.sql.value(_offset))) : (_d = [""], _d.raw = [""], utils_1.sql.query(_d)), utils_1.sql.identifier(cteIdentifier), utils_1.sql.identifier(cteIdentifier))));
                        return [4 /*yield*/, client.query(query)];
                    case 1:
                        rows = (_e.sent()).rows;
                        // If `last` was defined we reversed the order in Sql so our limit would
                        // work. We need to reverse again when we get here.
                        // TODO: We could implement an `O(1)` reverse with iterators. Then we
                        // won’t need to reverse in Sql. We could do that given we get `rows`
                        // back as an array. We know the final length and we could start
                        // returning from the end instead of the beginning.
                        if (last != null)
                            rows = rows.reverse();
                        values = rows.map(function (_a) {
                            var value = _a.value;
                            return ({
                                value: _this.pgPaginator.itemType.transformPgValueIntoValue(value),
                                cursor: pgAttributes.map(function (pgAttribute) { return value[pgAttribute.name]; }),
                            });
                        });
                        return [2 /*return*/, {
                                values: values,
                                // Gets whether or not we have more values to paginate through by
                                // running a simple, efficient Sql query to test.
                                hasNextPage: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                    var lastValue, lastCursor, rowCount, _a;
                                    return tslib_1.__generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                lastValue = values[values.length - 1];
                                                lastCursor = lastValue ? lastValue.cursor : beforeCursor;
                                                if (lastCursor == null)
                                                    return [2 /*return*/, false];
                                                return [4 /*yield*/, client.query(utils_1.sql.compile((_a = ["\n          select null\n          from ", "\n          where ", " and ", "\n          limit 1\n        "], _a.raw = ["\n          select null\n          from ", "\n          where ", " and ", "\n          limit 1\n        "], utils_1.sql.query(_a, fromSql, this._getCursorCondition(pgAttributes, lastCursor, descending ? '<' : '>'), conditionSql))))];
                                            case 1:
                                                rowCount = (_b.sent()).rowCount;
                                                return [2 /*return*/, rowCount !== 0];
                                        }
                                    });
                                }); },
                                // Gets whether or not we have more values to paginate through by
                                // running a simple, efficient Sql query to test.
                                hasPreviousPage: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                    var firstValue, firstCursor, rowCount, _a;
                                    return tslib_1.__generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                firstValue = values[0];
                                                firstCursor = firstValue ? firstValue.cursor : afterCursor;
                                                if (firstCursor == null)
                                                    return [2 /*return*/, false];
                                                return [4 /*yield*/, client.query(utils_1.sql.compile((_a = ["\n          select null\n          from ", "\n          where ", " and ", "\n          limit 1\n        "], _a.raw = ["\n          select null\n          from ", "\n          where ", " and ", "\n          limit 1\n        "], utils_1.sql.query(_a, fromSql, this._getCursorCondition(pgAttributes, firstCursor, descending ? '>' : '<'), conditionSql))))];
                                            case 1:
                                                rowCount = (_b.sent()).rowCount;
                                                return [2 /*return*/, rowCount !== 0];
                                        }
                                    });
                                }); },
                            }];
                }
            });
        });
    };
    /**
     * Gets the condition used to filter our result set using a cursor.
     *
     * @private
     */
    PgPaginatorOrderingAttributes.prototype._getCursorCondition = function (pgAttributes, cursor, operator) {
        return (_a = ["\n      (", ")\n      ", "\n      (", ")\n    "], _a.raw = ["\n      (", ")\n      ", "\n      (", ")\n    "], utils_1.sql.query(_a, utils_1.sql.join(pgAttributes.map(function (pgAttribute) { return utils_1.sql.identifier(pgAttribute.name); }), ', '), utils_1.sql.raw(operator), utils_1.sql.join(cursor.map(utils_1.sql.value), ', ')));
        var _a;
    };
    return PgPaginatorOrderingAttributes;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PgPaginatorOrderingAttributes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGdQYWdpbmF0b3JPcmRlcmluZ0F0dHJpYnV0ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcG9zdGdyZXMvaW52ZW50b3J5L3BhZ2luYXRvci9QZ1BhZ2luYXRvck9yZGVyaW5nQXR0cmlidXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLHFDQUFpQztBQUNqQyw4REFBd0Q7QUFZeEQ7Ozs7O0dBS0c7QUFDSDtJQU1FLHVDQUFhLE1BSVo7UUFDQyxJQUFJLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUE7UUFDckMsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQTtRQUN2RSxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUE7SUFDekMsQ0FBQztJQUVEOztPQUVHO0lBQ1UsZ0RBQVEsR0FBckIsVUFDRSxPQUFjLEVBQ2QsS0FBYSxFQUNiLE1BQThDOzs7Z0JBRXhDLE1BQU0sTUFDSixVQUFVLEVBQUUsWUFBWSxFQUN4QixZQUFZLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQW9CakQsZUFBZSxFQUNmLGFBQWEsRUFDYixPQUFPLEVBQ1AsWUFBWSxFQUVaLEtBQUssUUErQ0wsTUFBTTs7OztpQ0ExRUcsNkJBQW1CLENBQUMsT0FBTyxDQUFDOzZCQUNOLElBQUk7dUNBQ21CLE1BQU0sNkJBQU4sTUFBTSxzQkFBTixNQUFNLGVBQU4sTUFBTSxpQkFBTixNQUFNO3dCQUVsRSx3RUFBd0U7d0JBQ3hFLGtCQUFrQjt3QkFDbEIsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDOzRCQUNoQyxNQUFNLElBQUksS0FBSyxDQUFDLHlEQUF5RCxDQUFDLENBQUE7d0JBRTVFLG1FQUFtRTt3QkFDbkUscUVB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
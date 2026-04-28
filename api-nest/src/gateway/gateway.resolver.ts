import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AppDataService } from './app-data.service';
import {
  AuthPayload,
  Client,
  ClientInput,
  Department,
  DepartmentInput,
  Employee,
  EmployeeInput,
  Feedback,
  FeedbackInput,
  Item,
  ItemInput,
  LoginInput,
  OperationResult,
  Order,
  OrderItem,
  RegisterInput,
  SalesDashboardFiltersInput,
  SendEmailInput,
} from './graphql.types';
import { idText } from 'typescript';

@Resolver()
export class GatewayResolver {
  constructor(private readonly data: AppDataService) {}

  @Query(() => [Client])
  clients() {
    return this.data.getClients();
  }

  @Query(() => Client)
  client(@Args('id', { type: () => Int }) id: number) {
    return this.data.getClient(id);
  }

  @Query(() => [Department])
  departments() {
    return this.data.getDepartments();
  }

  @Query(() => Department)
  department(@Args('id', { type: () => Int }) id: number) {
    return this.data.getDepartment(id);
  }

  @Query(() => [Employee])
  employees() {
    return this.data.getEmployees();
  }

  @Query(() => Employee)
  employee(@Args('id', { type: () => Int }) id: number) {
    return this.data.getEmployee(id);
  }

  @Query(() => [Item])
  items() {
    return this.data.getItems();
  }

  @Query(() => Item)
  item(@Args('id', { type: () => Int }) id: number) {
    return this.data.getItem(id);
  }

  @Query(() => [Order])
  ordersByClient(@Args('clientId', { type: () => Int }) clientId: number) {
    return this.data.getOrdersByClient(clientId);
  }

  @Query(() => [OrderItem])
  orderItemsByOrder(@Args('orderId', { type: () => Int }) orderId: number) {
    return this.data.getOrderItemsByOrder(orderId);
  }

  @Query(() => String, { nullable: true })
  async salesDashboard(
    @Args('clientId', { type: () => Int }) clientId: number,
    @Args('filters', { type: () => SalesDashboardFiltersInput, nullable: true })
    filters?: SalesDashboardFiltersInput,
  ) {
    const normalizedFilters = filters
      ? {
          ...filters,
          employeeId: filters.employeeId ? Number(filters.employeeId) : undefined,
          itemId: filters.itemId ? Number(filters.itemId) : undefined,
        }
      : undefined;

    const dashboard = await this.data.getSalesDashboard(clientId, normalizedFilters);
    return JSON.stringify(dashboard ?? null);
  }

  @Mutation(() => Client)
  saveClient(
    @Args('input', { type: () => ClientInput }) input: ClientInput,
    @Args('id', { type: () => Int, nullable: true }) id?: number,
  ) {
    return this.data.saveClient(input, id);
  }

  @Mutation(() => OperationResult)
  async deleteClient(@Args('id', { type: () => Int }) id: number) {
    await this.data.deleteClient(id);
    return { success: true };
  }

  @Mutation(() => OperationResult)
  async sendClientEmail(@Args('input', { type: () => SendEmailInput }) input: SendEmailInput) {
    const result = await this.data.sendClientEmail(input);
    return {
      success: result?.success !== false,
      message: result?.message || null,
    };
  }

  @Mutation(() => Department)
  saveDepartment(
    @Args('input', { type: () => DepartmentInput }) input: DepartmentInput,
    @Args('id', { type: () => Int, nullable: true }) id?: number,
  ) {
    return this.data.saveDepartment(input, id);
  }

  @Mutation(() => OperationResult)
  async deleteDepartment(@Args('id', { type: () => Int }) id: number) {
    await this.data.deleteDepartment(id);
    return { success: true };
  }

  @Mutation(() => Employee)
  saveEmployee(
    @Args('input', { type: () => EmployeeInput }) input: EmployeeInput,
    @Args('id', { type: () => Int, nullable: true }) id?: number,
  ) {
    return this.data.saveEmployee(input, id);
  }

  @Mutation(() => OperationResult)
  async deleteEmployee(@Args('id', { type: () => Int }) id: number) {
    await this.data.deleteEmployee(id);
    return { success: true };
  }

  @Mutation(() => Item)
  saveItem(
    @Args('input', { type: () => ItemInput }) input: ItemInput,
    @Args('id', { type: () => Int, nullable: true }) id?: number,
  ) {
    return this.data.saveItem(input, id);
  }

  @Mutation(() => Item)
  adjustItemStock(
    @Args('id', { type: () => Int }) id: number,
    @Args('quantityChange', { type: () => Int }) quantityChange: number,
  ) {
    return this.data.adjustItemStock(id, quantityChange);
  }

  @Mutation(() => OperationResult)
  async deleteItem(@Args('id', { type: () => Int }) id: number) {
    await this.data.deleteItem(id);
    return { success: true };
  }

  @Mutation(() => Client)
  register(@Args('input', { type: () => RegisterInput }) input: RegisterInput) {
    return this.data.register(input);
  }

  @Mutation(() => AuthPayload)
  async login(@Args('input', { type: () => LoginInput }) input: LoginInput) {
    return this.data.login(input);
  }



  @Query(() => Feedback)
  feedback(@Args('id', { type: () => Int }) id: number) {
    return this.data.getFeedbackById(id);
  }
  @Query(() => [Feedback])
  feedbacks() {
    return this.data.getFeedbacks();
  }

 @Mutation(() => Feedback)
  saveFeedback(
    @Args('input', { type: () =>  FeedbackInput}) input: FeedbackInput,

  ) {
    return this.data.saveFeedback(input);
  }
   @Mutation(() => Client)
  updateFeedback(
    @Args('input', { type: () => FeedbackInput }) input: FeedbackInput,
    @Args('id', { type: () => Int, nullable: true }) id?: number,
  ) {
    return this.data.updateFeedback(id, input);
  }


  
}


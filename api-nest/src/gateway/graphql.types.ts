import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';


@ObjectType()
export class Client {
  @Field(() => Int)
  client_id!: number;

  @Field()
  client_name!: string;

  @Field()
  client_email!: string;

  @Field(() => String, { nullable: true })
  client_dob?: string | null;

  @Field(() => String, { nullable: true })
  role?: string | null;
}

@ObjectType()
export class Department {
  @Field(() => Int)
  dep_id!: number;

  @Field()
  dep_name!: string;
}

@ObjectType()
export class Employee {
  @Field(() => Int)
  employee_id!: number;

  @Field()
  employee_name!: string;

  @Field()
  employee_email!: string;

  @Field()
  employee_role!: string;

  @Field(() => String, { nullable: true })
  employee_dob?: string | null;

  @Field(() => Int, { nullable: true })
  employee_department?: number | null;
}

@ObjectType()
export class Item {
  @Field(() => Int)
  item_id!: number;

  @Field()
  item_name!: string;

  @Field()
  item_sku!: string;

  @Field(() => Float)
  unit_price!: number;

  @Field(() => Int)
  stock_quantity!: number;

  @Field(() => String, { nullable: true })
  category?: string | null;
}

@ObjectType()
export class Order {
  @Field(() => Int)
  order_id!: number;

  @Field(() => Int, { nullable: true })
  customer_id?: number | null;

  @Field(() => String, { nullable: true })
  order_date?: string | null;

  @Field(() => Float, { nullable: true })
  order_total?: number | null;

  @Field(() => String, { nullable: true })
  order_status?: string | null;
}

@ObjectType()
export class OrderItem {
  @Field(() => Int)
  order_item_id!: number;

  @Field(() => Int)
  order_id!: number;

  @Field(() => Int)
  item_id!: number;

  @Field(() => Int)
  quantity!: number;

  @Field(() => Float)
  unit_price!: number;
}

@ObjectType()
export class OperationResult {
  @Field()
  success!: boolean;

  @Field(() => String, { nullable: true })
  message?: string | null;
}

@ObjectType()
export class AuthPayload {
  @Field()
  authenticated!: boolean;

  @Field(() => Client)
  client!: Client;
}

@InputType()
export class ClientInput {
  @Field()
  name!: string;

  @Field()
  email!: string;
}

@InputType()
export class DepartmentInput {
  @Field()
  name!: string;
}

@InputType()
export class EmployeeInput {
  @Field()
  employee_name!: string;

  @Field()
  employee_email!: string;

  @Field()
  employee_role!: string;

  @Field()
  employee_dob!: string;

  @Field(() => Int)
  employee_department!: number;
}

@InputType()
export class ItemInput {
  @Field()
  item_name!: string;

  @Field()
  item_sku!: string;

  @Field(() => Float)
  unit_price!: number;

  @Field(() => Int)
  stock_quantity!: number;
}

@InputType()
export class LoginInput {
  @Field()
  client_email!: string;

  @Field()
  password!: string;
}

@InputType()
export class RegisterInput {
  @Field()
  client_name!: string;

  @Field()
  client_email!: string;

  @Field()
  client_dob!: string;

  @Field()
  password!: string;

  @Field()
  role!: string;
}

@InputType()
export class SendEmailInput {
  @Field()
  to!: string;

  @Field()
  subject!: string;

  @Field()
  text!: string;
}

@InputType()
export class SalesDashboardFiltersInput {
  @Field(() => String, { nullable: true })
  startDate?: string;

  @Field(() => String, { nullable: true })
  endDate?: string;

  @Field(() => String, { nullable: true })
  employeeId?: string;

  @Field(() => String, { nullable: true })
  itemId?: string;

  @Field(() => String, { nullable: true })
  category?: string;

  @Field(() => String, { nullable: true })
  bucket?: string;

  @Field(() => Int, { nullable: true })
  lowSalesThreshold?: number;
}

@ObjectType()
export class Feedback 
{
  @Field(() => Int, {nullable: false})
  id!: number;
  @Field()
  comment!: string;
  @Field()
  @Min(0)
  @Max(5)
  rate!: number;
}

@InputType()
export class FeedbackInput
{
  @Field()
  id!: number;
  @Field()
  comment!: string;
  @Field()
  rate!: number;
}
